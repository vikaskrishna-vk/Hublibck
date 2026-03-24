const Auction = require("../models/Auction");

module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("placeBid", async (data) => {

      try {

        const { auctionId, amount, bidder } = data;

        if (!auctionId || !amount) {
          socket.emit("bidError", "Invalid bid data");
          return;
        }

        const auction = await Auction.findById(auctionId);

        if (!auction) {
          socket.emit("bidError", "Auction not found");
          return;
        }

        // Initialize highestBid if empty
        if (!auction.highestBid) {
          auction.highestBid = auction.basePrice;
        }

        // Check auction time
        if (new Date() > new Date(auction.endTime)) {
          socket.emit("bidError", "Auction closed");
          return;
        }

        // Ensure bid is higher
        if (amount <= auction.highestBid) {
          socket.emit("bidError", "Bid must be higher than current highest bid");
          return;
        }

        // Update auction
        auction.highestBid = amount;
        auction.highestBidder = bidder;

        await auction.save();

        const bidData = {
          auctionId: auction._id.toString(),
          amount: auction.highestBid,
          bidder: auction.highestBidder,
          highestBid: auction.highestBid,
          highestBidder: auction.highestBidder,
          time: new Date().toLocaleTimeString()
        };


        io.on("connection",(socket)=>{

socket.on("placeBid",(data)=>{

io.emit("newBid",data)

})

})
        // Send update to all connected users
        io.emit("newBid", bidData);

        console.log("New bid:", bidData);

      } catch (error) {

        console.error("Socket bid error:", error);

        socket.emit("bidError", "Server error placing bid");

      }

    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

  });

};