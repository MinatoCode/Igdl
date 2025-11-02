const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Helper: extract shortcode from URL
function extractShortcode(url) {
  const match = url.match(/\/p\/([^/?#]+)/);
  return match ? match[1] : null;
}

app.get("/download", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: "Missing ?url query" });

  const shortcode = extractShortcode(url);
  if (!shortcode) return res.status(400).json({ success: false, error: "Invalid Instagram URL" });

  try {
    const graphURL = `https://www.instagram.com/graphql/query/?doc_id=8845758582119845&variables={"shortcode":"${shortcode}"}`;

    const response = await axios.get(graphURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    const data = response.data?.data?.xdt_shortcode_media;
    if (!data) return res.status(404).json({ success: false, error: "Media not found" });

    // Extract structured info
    const structured = {
      success: true,
      author: "ItachiXD",
      platform: "instagram",
      url: data.video_url || data.display_url || null,
    };

    res.json(structured);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
