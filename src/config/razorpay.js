const Razorpay = require("razorpay")

const razorpay = new Razorpay({

key_id:"YOUR_RAZORPAY_KEY",
key_secret:"YOUR_SECRET"

})

module.exports = razorpay