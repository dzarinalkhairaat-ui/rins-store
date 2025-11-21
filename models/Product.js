const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama produk wajib diisi']
  },
  description: {
    type: String,
    required: [true, 'Deskripsi wajib diisi']
  },
  price: {
    type: Number,
    required: [true, 'Harga wajib diisi']
  },
  image: {
    type: String,
    required: [true, 'Link gambar wajib ada']
  },
  category: {
    type: String,
    required: [true, 'Kategori wajib dipilih']
  },
  // Subkategori TETAP ADA (karena fitur ini sudah berhasil sebelumnya)
  subcategory: {
    type: String,
    default: '' 
  },
  type: {
    type: String,
    required: true,
    enum: ['affiliate', 'dropship'],
    default: 'dropship'
  },
  // Field khusus Affiliate
  affiliateLink: {
    type: String,
    required: function() { return this.type === 'affiliate'; }
  },
  affiliatePlatform: {
    type: String,
    enum: ['shopee', 'tokopedia', 'tiktok', 'other'],
    default: 'other'
  },
  // Field khusus Dropship
  stock: {
    type: Number,
    default: 0,
    required: function() { return this.type === 'dropship'; }
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);