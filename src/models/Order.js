const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  paymentType: { type: String, enum: ['COD', 'Online'], required: true },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  deliveryAddress: { type: String, required: true },
  farmerName: { type: String },
  productName: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);