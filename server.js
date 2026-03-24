require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

/* DB */
const connectDB = require("./src/config/db");

/* ROUTES */
const authRoutes = require("./src/routes/authRoutes");
const cropRoutes = require("./src/routes/cropRoutes");
const fertilizerRoutes = require("./src/routes/fertilizerRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const productRoutes = require("./src/routes/productRoutes");
const auctionRoutes = require("./src/routes/auctionRoutes");

/* SOCKET */
const auctionSocket = require("./src/socket/auctionSocket");

/* INIT */
const app = express();
const server = http.createServer(app);

/* CONNECT DATABASE */
connectDB();

/* MIDDLEWARE */
app.use(cors({
  origin: "*", // later restrict for frontend URL
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* STATIC */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ROUTES */
app.get("/", (req, res) => {
  res.send("🌾 Agri Marketplace API Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/fertilizers", fertilizerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auction", auctionRoutes);

/* SOCKET.IO */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

auctionSocket(io);

/* ERROR HANDLER (IMPORTANT FOR DEPLOYMENT) */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: "Server Error" });
});

/* PORT (Railway uses dynamic port) */
const PORT = process.env.PORT || 5000;

/* START SERVER */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
