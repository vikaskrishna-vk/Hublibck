const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  bidder: String,
  amount: Number,
  time: {
    type: Date,
    default: Date.now
  }
});

const auctionSchema = new mongoose.Schema({

  cropName: String,
  quantity: Number,
  basePrice: Number,

  farmerName: String,
  farmerPhone: String,

  highestBid: Number,
  highestBidder: String,

  bids: [bidSchema],

  startTime: Date,
  endTime: Date,

  status: {
    type: String,
    default: "active"
  }

});

module.exports = mongoose.model("Auction", auctionSchema);