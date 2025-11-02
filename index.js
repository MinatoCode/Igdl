const axios = require("axios");

module.exports = async (req, res) => {
  const { url } = req.query || req.body || {};

  if (!url)
    return res.status(400).json({ success: false, error: "Missing Instagram URL" });

  try {
    // Extract shortcode dynamically
    const match = url.match(/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
    if (!match)
      return res.status(400).json({ success: false, error: "Invalid Instagram URL" });

    const shortcode = match[1];

    // Generate a fresh GraphQL URL every time
    const variables = { shortcode };
    const doc_id = 8845758582119845; // stable GraphQL ID for media
    const graphURL = `https://www.instagram.com/graphql/query/?doc_id=${doc_id}&variables=${encodeURIComponent(
      JSON.stringify(variables)
    )}&_=${Date.now()}`; // add timestamp to bypass caching

    // Make request with fresh headers
    let response = await axios.get(graphURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0",
        "Accept": "application/json",
        "X-IG-App-ID": "936619743392459",
        Referer: "https://www.instagram.com/",
      },
    });

    let mediaData = response?.data?.data?.xdt_shortcode_media;

    if (!mediaData) {
      // fallback to oEmbed
      const oembed = await axios.get(
        `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}`
      );
      if (!oembed.data)
        throw new Error("Both GraphQL and oEmbed failed to fetch media");

      return res.json({
        success: true,
        author: "MinatoCode",
        platform: "instagram",
        media_author: oembed.data.author_name,
        url: oembed.data.thumbnail_url,
        caption: oembed.data.title || "",
      });
    }

    const author =
      mediaData.owner?.username || mediaData.owner?.full_name || "Unknown";

    const mediaUrl =
      mediaData.video_url ||
      mediaData.display_url ||
      mediaData.edge_sidecar_to_children?.edges?.[0]?.node?.video_url ||
      mediaData.edge_sidecar_to_children?.edges?.[0]?.node?.display_url ||
      null;

    res.json({
      success: true,
      author: "MinatoCode",
      platform: "instagram",
      media_author: author,
      url: mediaUrl,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
