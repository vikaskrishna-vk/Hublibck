const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({

  cropId:String,

  buyerId:String,

  bidAmount:Number

});

module.exports = mongoose.model("Bid",bidSchema);