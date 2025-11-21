require('dotenv').config(); // Memuat variabel dari .env
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

// Inisialisasi App
const app = express();

// 1. Koneksi Database
connectDB();

// 2. Middleware (Satpam/Pengatur Lalu Lintas)
app.use(cors()); // Mengizinkan akses dari frontend manapun (bisa diperketat nanti)
app.use(express.json()); // Supaya server mengerti data JSON
app.use(express.urlencoded({ extended: false }));

// 3. Test Route (Untuk memastikan server jalan)
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Server Rins Store Berjalan Normal!',
    status: 'Active',
    timestamp: new Date()
  });
});

// 4. API Routes (Akan kita aktifkan bertahap setelah file routes diisi)
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/products', require('../routes/productRoutes'));
app.use('/api/affiliate', require('../routes/affiliateRoutes'));

app.use('/api/banners', require('../routes/bannerRoutes'));

// 5. Listener (Hanya berjalan saat di local/development, Vercel handle ini otomatis)
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });
}

// Export untuk Vercel Serverless
module.exports = app;