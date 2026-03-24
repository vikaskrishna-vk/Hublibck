const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const Product = require('../models/Products');
const Notification = require('../models/Notification');


/* ---------------- GET ALL ORDERS ---------------- */

router.get('/', async (req, res) => {
  try {

    const orders = await Order.find()
      .populate('farmer', 'name email phone')
      .populate('product', 'name image category')
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ---------------- DASHBOARD STATS ---------------- */

router.get('/dashboard', async (req, res) => {
  try {

    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: 'Pending' });
    const accepted = await Order.countDocuments({ status: 'Accepted' });
    const shipped = await Order.countDocuments({ status: 'Shipped' });
    const delivered = await Order.countDocuments({ status: 'Delivered' });
    const cancelled = await Order.countDocuments({ status: 'Cancelled' });

    const recentOrders = await Order.find()
      .populate('farmer', 'name')
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .limit(5);

    const totalProducts = await Product.countDocuments();

    res.json({
      total,
      pending,
      accepted,
      shipped,
      delivered,
      cancelled,
      recentOrders,
      totalProducts
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ---------------- UPDATE ORDER STATUS ---------------- */

router.put('/:id/status', async (req, res) => {
  try {

    const { status } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('farmer', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    await Notification.create({
      message: `Order #${order._id.toString().slice(-6).toUpperCase()} status updated to ${status}`,
      order: order._id,
      farmerName: order.farmer?.name || order.farmerName,
      type: 'status_change'
    });

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ---------------- FARMER PLACE ORDER ---------------- */

router.post('/place', async (req, res) => {
  try {

    const {
      farmerId,
      farmerName,
      productId,
      quantity,
      paymentType,
      deliveryAddress
    } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const order = await Order.create({
      farmer: farmerId,
      product: productId,
      quantity,
      totalPrice: product.price * quantity,
      paymentType,
      deliveryAddress,
      farmerName,
      productName: product.name
    });

    await Notification.create({
      message: `New order placed by ${farmerName} for ${product.name} (Qty: ${quantity})`,
      order: order._id,
      farmerName,
      type: 'new_order'
    });

    res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;