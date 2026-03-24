const express = require("express");
const router = express.Router();

const Auction = require("../models/Auction");
const Bid = require("../models/Bid");

// CREATE AUCTION
router.post("/create", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(18, 0, 0);

    const end = new Date();
    end.setHours(22, 0, 0);

    const auction = new Auction({
      cropName: req.body.cropName,
      quantity: req.body.quantity,
      basePrice: req.body.basePrice,
      highestBid: req.body.basePrice,
      farmerName: req.body.farmerName,
      farmerPhone: req.body.farmerPhone,
      startTime: start,
      endTime: end,
    });

    await auction.save();

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: "Create auction error" });
  }
});

router.post("/bid/:id", async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const now = new Date();

    if (now > auction.endTime) {
      return res.json({ message: "Auction closed" });
    }

    const bidAmount = Number(req.body.bid);
    const bidder = req.body.bidder;

    if (bidAmount <= auction.highestBid) {
      return res.json({
        message: "Bid must be higher than current bid",
      });
    }

    // ✅ ADD BID INSIDE AUCTION
    auction.bids.push({
      bidder,
      phone: req.body.phone,
      place: req.body.place,
      amount: bidAmount,
    });

    // ✅ UPDATE HIGHEST
    auction.highestBid = bidAmount;
    auction.highestBidder = bidder;

    await auction.save();

    res.json({
      message: "Bid placed",
      highestBid: auction.highestBid,
      highestBidder: auction.highestBidder,
      bids: auction.bids,
    });
  } catch (error) {
    res.status(500).json({ message: "Bid error" });
  }
});

// GET ALL AUCTIONS
router.get("/", async (req, res) => {
  try {
    const auctions = await Auction.find();

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching auctions" });
  }
});

// GET BIDS OF AUCTION
router.get("/bids/:id", async (req, res) => {
  try {
    const bids = await Bid.find({
      auctionId: req.params.id,
    }).sort({ _id: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bids" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: "Error fetching auction" });
  }
});

router.get("/result/:id", async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const now = new Date();

    // ❌ If auction still running
    if (now < auction.endTime) {
      return res.json({ message: "Auction still running" });
    }

    // ❌ No bids
    if (!auction.highestBidder) {
      return res.json({ message: "No bids placed" });
    }

    // ✅ Find winner details
    const winner = auction.bids.find((b) => b.bidder === auction.highestBidder);

    res.json({
      message: "Auction Result",
      winnerName: winner.bidder,
      phone: winner.phone,
      place: winner.place,
      highestBid: auction.highestBid,
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting result" });
  }
});

module.exports = router;
