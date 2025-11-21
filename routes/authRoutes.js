const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. LOGIN ADMIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        whatsapp1: admin.whatsapp1, // Kirim data WA ke frontend
        whatsapp2: admin.whatsapp2,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Email atau Password salah' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. UPDATE PROFIL (EMAIL, WA, PASSWORD)
router.put('/profile', protect, async (req, res) => {
    const user = await Admin.findById(req.admin._id);

    if (user) {
        // Update Email & WA (Jika dikirim)
        if (req.body.email) user.email = req.body.email;
        if (req.body.whatsapp1) user.whatsapp1 = req.body.whatsapp1;
        if (req.body.whatsapp2) user.whatsapp2 = req.body.whatsapp2;

        // Update Password (Hanya jika diisi)
        if (req.body.password && req.body.password.length > 0) {
            user.password = req.body.password; 
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            whatsapp1: updatedUser.whatsapp1,
            whatsapp2: updatedUser.whatsapp2,
            token: generateToken(updatedUser._id),
            message: 'Pengaturan berhasil disimpan!'
        });
    } else {
        res.status(404).json({ message: 'User tidak ditemukan' });
    }
});

// 3. PUBLIC INFO (Untuk Halaman Cart mengambil No WA)
router.get('/store-info', async (req, res) => {
    try {
        // Ambil admin pertama saja (sebagai pemilik toko)
        const admin = await Admin.findOne().select('whatsapp1 whatsapp2');
        if(admin) {
            res.json(admin);
        } else {
            res.json({ whatsapp1: '', whatsapp2: '' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. REGISTER (Sekali pakai)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const adminExists = await Admin.findOne({ email });
        if(adminExists) return res.status(400).json({message: "Admin sudah terdaftar"});
        const admin = await Admin.create({ username, email, password });
        if(admin) {
            res.status(201).json({
                _id: admin._id,
                username: admin.username,
                token: generateToken(admin._id)
            });
        }
    } catch (error) { res.status(400).json({ message: error.message }); }
});

module.exports = router;