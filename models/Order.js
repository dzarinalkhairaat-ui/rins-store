const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      subtotal: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['BRI', 'BSI', 'SeaBank', 'Dana', 'GoPay', 'ShopeePay', 'QRIS']
  },
  status: {
    type: String,
    default: 'pending', // pending -> confirmed -> completed
    enum: ['pending', 'confirmed', 'completed', 'cancelled']
  },
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);