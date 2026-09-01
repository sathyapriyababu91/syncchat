const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");

const userRoutes = require("./routes/user.routes");
const statusRoutes = require("./routes/status.routes");
const messageRoutes = require("./routes/message.routes");
const otpRoutes = require("./routes/otp.routes");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const socketHandler = require("./socket/socket");
const { setIO } = require("./socket/socketInstance");

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/otp", otpRoutes);

// Profile uploads
app.use("/uploads", express.static("uploads"));

// HTTP Server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
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