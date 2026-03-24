const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({

  cropName:String,

  quantity:Number,

  quality:String,

  minPrice:Number,

  currentBid:{
    type:Number,
    default:0
  }

});

module.exports = mongoose.model("Crop",cropSchema);