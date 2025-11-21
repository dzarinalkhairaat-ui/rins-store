const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Opsi ini memastikan kompatibilitas dengan versi MongoDB terbaru
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Terkoneksi: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error Koneksi Database: ${error.message}`);
    // Jangan matikan proses di mode development Vercel, cukup log error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;