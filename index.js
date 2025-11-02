const axios = require("axios");

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: "Missing ?url query" });

  // Remove query params
  const cleanUrl = url.split("?")[0];

  // Match p, reel, or tv shortcode
  const match = cleanUrl.match(/\/(p|reel|tv)\/([^\/]+)/);
  if (!match) return res.status(400).json({ success: false, error: "Invalid Instagram URL" });

  const shortcode = match[2];

  try {
    const graphURL = `https://www.instagram.com/graphql/query/?doc_id=8845758582119845&variables={"shortcode":"${shortcode}"}`;

    const response = await axios.get(graphURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    const media = response.data?.data?.xdt_shortcode_media;
    if (!media) return res.status(404).json({ success: false, error: "Media not found" });

    res.json({
      success: true,
      author: "MinatoCode",
      platform: "instagram",
      url: media.video_url || media.display_url || null,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Failed to fetch Instagram media" });
  }
};
