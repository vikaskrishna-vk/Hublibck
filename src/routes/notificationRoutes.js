const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");

/* -------- GET NOTIFICATIONS -------- */

router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({
      dealer: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      dealer: req.user._id,
      isRead: false,
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------- MARK ALL NOTIFICATIONS AS READ -------- */

router.put("/read",  async (req, res) => {
  try {
    await Notification.updateMany(
      { dealer: req.user._id, isRead: false },
      { isRead: true },
    );

    res.json({
      message: "All notifications marked as read",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------- MARK SINGLE NOTIFICATION AS READ -------- */

router.put("/:id/read", async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        dealer: req.user._id,
      },
      {
        isRead: true,
      },
    );

    res.json({
      message: "Notification marked as read",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
