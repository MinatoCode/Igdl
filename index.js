const axios = require("axios");

const COOKIES = "_ga-GA1.1=902018491.1763389124; gads=ID-56591f1daa06286e:T-1763825837:S=ALNI_MYXVbjpVynhn7KFC5S9N83RdzclAg; gp-UID-000011b7baab14c6:T-1763826837:S=ALNI_MYuWrVmQITFRNyxZzwEqgKBiCWASQ; _eoi=ID=5f5ed2c0e2d78cf2:T-1763826837:S=AA-Afjb803XH1WulbuEqKw1Cynwu; FCCDCF=[null,null,null,null,null,null,[[32,\"[\\\"99554747-5dea-4d96-8f14-fe3849740d85\\\",1763389126,373000000]\"]]]; FCNEC=[[\"AKsRol_SRpbhll1fPyXmL1LY35la3cwpVy2MeejAnSy/SEZSKKLIVZKm0tx45ny2zcs0gLgLAG43uzQWtr1wqH2XMgTf0JXziAc82zEYE5lByhneHblUyT1ITRp82FtoHNaQSUbr.JiKaTpFoeL1jnXe1140Al2-uw==\"]]; ga_5C2FBJKJSV-GS2.1.517638268365035=15117638271948/14510Sh0";

module.exports = async function handler(req, res) {
  try {
    const url = req.query.url;

    if (!url)
      return res.status(400).json({ success: false, error: "No URL provided." });

    const reelId = url.match(/\/reel\/([^/?]+)/)?.[1];
    let igsh = url.match(/igsh=([^&]+)/)?.[1];

    // If igsh is missing or empty, set it to '/'
    if (!igsh) igsh = "/";

    if (!reelId)
      return res.status(400).json({ success: false, error: "Invalid reel URL." });

    const endpoint = `https://reelsvideo.io/reel/${reelId}/?igsh=${igsh}/`;

    const form = new URLSearchParams({
      id: url,
      locale: "en",
      tt: "668d1309bdcfaa6c847ff4f5a0b6cf9a",
      ts: Math.floor(Date.now() / 1000),
    });

    const response = await axios.post(endpoint, form.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Mobile Safari",
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: COOKIES,
      },
    });

    const data = response.data;

    // Extract all ssscdn.io URLs
    const allUrls = JSON.stringify(data).match(/https:\/\/ssscdn\.io\/reelsvideo\/[^\s"']+/g) || [];

    // Filter URLs that do NOT have /a/ or /p/ immediately after reelsvideo/
    const mainUrls = allUrls.filter(u => !/^https:\/\/ssscdn\.io\/reelsvideo\/[ap]\//.test(u));

    const finalUrl = mainUrls[0] || null;

    if (!finalUrl)
      return res.status(500).json({
        success: false,
        error: "Failed to extract main video URL (without /a/ or /p/).",
        raw: data,
      });

    res.json({ success: true, video: finalUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
