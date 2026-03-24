const express = require("express");
const router = express.Router();

const Fertilizer = require("../models/Fertilizer");

/* GET ALL FERTILIZERS */

router.get("/", async (req, res) => {
  try {

    const fertilizers = await Fertilizer.find();

    res.json(fertilizers);

  } catch (err) {

    res.status(500).json({ message: "Server Error" });

  }
});

module.exports = router;