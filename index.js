const axios = require("axios");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url)
    return res.status(400).json({ success: false, error: "Missing ?url query parameter" });

  try {
    // Extract shortcode (supports /p/, /reel/, /tv/)
    const cleanUrl = url.split("?")[0];
    const match = cleanUrl.match(/\/(p|reel|tv)\/([^\/]+)/);
    if (!match)
      return res.status(400).json({ success: false, error: "Invalid Instagram URL" });

    const shortcode = match[2];
    const graphURL = `https://www.instagram.com/graphql/query/?doc_id=8845758582119845&variables={"shortcode":"${shortcode}"}`;

    // Try fetching the GraphQL data
    const response = await axios.get(graphURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "X-IG-App-ID": "936619743392459", // Instagram web app ID
        "Referer": "https://www.instagram.com/",
      },
    });

    const media = response.data?.data?.xdt_shortcode_media;
    if (!media)
      return res.status(404).json({ success: false, error: "Media not found or private" });

    // Parse author and media URL
    const mediaAuthor =
      media.owner?.username || media.owner?.full_name || "Unknown";
    const videoUrl = media.video_url || media.display_url || null;

    res.json({
      success: true,
      author: "MinatoCode",
      platform: "instagram",
      media_author: mediaAuthor,
      url: videoUrl,
    });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch Instagram media (possibly private or restricted)",
    });
  }
};
