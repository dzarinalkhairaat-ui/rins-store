const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { protect } = require('../middleware/authMiddleware');

// 1. AMBIL SEMUA BANNER (Public)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({});
    // Ubah array menjadi object agar mudah diakses di frontend
    // Contoh: { 'home_1': { imageUrl: '...', title: '...' } }
    const bannerMap = {};
    banners.forEach(b => { bannerMap[b.key] = b; });
    res.json(bannerMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. UPDATE / SIMPAN BANNER (Admin Only)
router.post('/', protect, async (req, res) => {
  const { key, imageUrl, title, subtitle, linkText } = req.body;
  try {
    // Cari banner berdasarkan key, jika ada update, jika tidak buat baru (upsert)
    const updatedBanner = await Banner.findOneAndUpdate(
      { key },
      { imageUrl, title, subtitle, linkText },
      { new: true, upsert: true } // Opsi penting: Update if exists, Insert if not
    );
    res.json(updatedBanner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;