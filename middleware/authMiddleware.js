const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  // Cek jika ada header Authorization dengan format "Bearer token"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil tokennya saja
      token = req.headers.authorization.split(' ')[1];
      
      // Dekripsi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Cari admin berdasarkan ID di token
      req.admin = await Admin.findById(decoded.id).select('-password');
      
      next(); // Lanjut ke proses berikutnya
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };