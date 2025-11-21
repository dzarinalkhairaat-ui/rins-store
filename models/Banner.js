const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true 
    // Contoh isi key: 'home_1', 'home_2', 'home_3', 'about_hero', 'help_hero'
  },
  imageUrl: { type: String, required: true },
  title: { type: String, default: '' },    // Judul Banner (Khusus Home)
  subtitle: { type: String, default: '' }, // Subjudul (Khusus Home)
  linkText: { type: String, default: 'Cek Sekarang' } // Teks Tombol
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);