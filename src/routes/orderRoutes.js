const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const router = express.Router();

// ✅ Import models (DON’T MISS THIS)
const Order = require("../models/Order");
const Product = require("../models/Products");

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/* =========================
   CREATE PAYMENT ORDER
========================= */
router.post("/create-payment", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const amount = product.price * (quantity || 1);

    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹ → paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Payment creation failed" });
  }
});

/* =========================
   VERIFY PAYMENT
========================= */
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      phone,
      location,
      quantity,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // ✅ Payment Verified

      const product = await Product.findById(productId);

      const order = await Order.create({
        product: productId,
        farmer: product?.dealer || null,
        phone,
        location,
        paymentMethod: "ONLINE",
        quantity: quantity || 1,
        totalPrice: product?.price || 0,
        paymentStatus: "Paid",
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        status: "Pending",
      });

      return res.json({ success: true, order });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Verification failed" });
  }
});

/* =========================
   PLACE ORDER (COD ONLY)
========================= */
router.post("/place", async (req, res) => {
  try {
    const { productId, phone, location, paymentMethod, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (paymentMethod === "ONLINE") {
      return res.status(400).json({
        message: "Use Razorpay for online payment",
      });
    }

    const order = await Order.create({
      product: productId,
      farmer: product?.dealer || null,
      phone,
      location,
      paymentMethod: "COD",
      quantity: quantity || 1,
      totalPrice: product?.price || 0,
      paymentStatus: "Pending",
      status: "Pending",
    });

    res.json({ success: true, order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Order failed" });
  }
});

/* =========================
   GET ALL ORDERS (OPTIONAL)
========================= */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* =========================
   UPDATE ORDER STATUS
========================= */
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
});

/* =========================
   EXPORT (MUST BE LAST)
========================= */
module.exports = router;
