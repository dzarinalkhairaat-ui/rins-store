const express = require('express');
const router = express.Router();

router.post('/validate', (req, res) => {
  const { link, platform } = req.body;
  
  let isValid = false;
  
  // --- UPDATE POLA VALIDASI (REGEX) ---
  const patterns = {
    // Shopee: shopee.co.id atau shope.ee
    shopee: /(shopee\.co\.id|shope\.ee)/,
    
    // Tokopedia: tokopedia.com atau tokopedia.link
    tokopedia: /(tokopedia\.com|tokopedia\.link|vt\.tokopedia\.com)/,
    
    // TikTok Shop: 
    // Menerima 'tiktok.com', 'vt.tiktok.com' 
    // DAN JUGA 'vt.tokopedia.com' (karena merger Shop | Tokopedia)
    tiktok: /(tiktok\.com|vt\.tiktok\.com|vt\.tokopedia\.com)/,
    
    other: /./ // Selalu true untuk 'other'
  };

  // Cek apakah link sesuai dengan platform yang dipilih
  if (patterns[platform] && patterns[platform].test(link)) {
    isValid = true;
  }

  if (isValid) {
    res.json({ valid: true, message: "Link Valid & Terverifikasi" });
  } else {
    // Pesan Error Lebih Spesifik
    let correctPlatform = "";
    if (link.includes("shopee")) correctPlatform = "Shopee";
    else if (link.includes("tokopedia")) correctPlatform = "Tokopedia/TikTok";
    else if (link.includes("tiktok")) correctPlatform = "TikTok";

    res.json({ 
      valid: false, 
      message: `Link tidak cocok! Sepertinya ini link ${correctPlatform || 'lain'}, bukan ${platform}.` 
    });
  }
});

module.exports = router;