const mongoose = require("mongoose");

const fertilizerSchema = new mongoose.Schema({

  name:String,

  price:Number,

  quantity:Number,

  description:String

});

module.exports = mongoose.model("Fertilizer",fertilizerSchema);