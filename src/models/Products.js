const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
dealer:{
type: mongoose.Schema.Types.ObjectId,
ref: "User"
},

name:{
type:String,
required:true,
trim:true
},

category:{
type:String,
required:true,
enum:["Seeds","Fertilizers","Pesticides"]
},

price:{
type:Number,
required:true,
min:0
},

quantity:{
type:Number,
required:true,
min:0
},

description:{
type:String,
required:true
},

image:{
type:String,
default:""
},

isActive:{
type:Boolean,
default:true
}

},
{ timestamps:true }
)

module.exports = mongoose.model("Product", productSchema)