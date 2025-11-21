const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // TAMBAHAN BARU: Nomor WhatsApp
  whatsapp1: {
    type: String,
    default: '6281234567890' // Default dummy
  },
  whatsapp2: {
    type: String,
    default: '6289876543210' // Default dummy
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['superadmin', 'admin']
  }
}, {
  timestamps: true
});

// MIDDLEWARE: Enkripsi password sebelum disimpan
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);