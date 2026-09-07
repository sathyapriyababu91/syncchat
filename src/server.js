const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dns = require("dns");

const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const statusRoutes = require("./routes/status.routes");
const messageRoutes = require("./routes/message.routes");


const socketHandler = require("./socket/socket");
const { setIO } = require("./socket/socketInstance");

const app = express();

// 1. CORS Configuration for Express
app.use(cors({
  origin: ["https://sycchat.netlify.app", "http://localhost:5173"],
  credentials: true
}));

app.use(express.json());

// DNS Servers setup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Test Route
app.get("/", (req, res) => {
  res.send("SyncChat Backend Running...");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/message", messageRoutes);


// Profile uploads folder
app.use("/uploads", express.static("uploads"));

// HTTP Server creation
const server = http.createServer(app);

// 2. Socket.IO CORS Fix (Matches Express configuration)
const io = new Server(server, {
  cors: {
    origin: ["https://sycchat.netlify.app", "http://localhost:5173"],
    credentials: true
  },
});

setIO(io);
socketHandler(io);

// Connect Database & Fix Old Index Error
connectDB().then(() => {
  mongoose.connection.collections["users"]
    .dropIndex("email_1")
    .then(() => console.log("✅ Old email index deleted successfully!"))
    .catch(() => console.log("ℹ️ Old email index already removed or not found."));
});

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});