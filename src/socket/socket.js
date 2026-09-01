const User = require("../models/user.model");

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // USER JOIN
    socket.on("join", async (userId) => {
      try {
        if (!userId || userId === "undefined") return;

        const id = String(userId);
        onlineUsers.set(id, socket.id);

        await User.findByIdAndUpdate(id, { isOnline: true });
        console.log("User online:", id);

        // Broadcast to all connected clients the updated online users list
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      } catch (error) {
        console.log("Join error:", error);
      }
    });

    // USER TYPING
    socket.on("typing", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId: String(data.senderId),
        });
      }
    });

    // USER STOP TYPING
    socket.on("stopTyping", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStopTyping", {
          userId: String(data.senderId),
        });
      }
    });

    // SEND REAL-TIME MESSAGE
    socket.on("sendMessage", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          sender: data.senderId,
          receiver: data.receiverId,
          message: data.message,
        });
      }
    });

    // AUDIO / VIDEO CALLS
    socket.on("callUser", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incomingCall", {
          callerId: data.callerId,
          callerName: data.callerName,
          callType: data.callType,
        });
      }
    });

    socket.on("acceptCall", (data) => {
      const callerSocketId = onlineUsers.get(String(data.callerId));
      if (callerSocketId) {
        io.to(callerSocketId).emit("callAccepted", {
          receiverId: data.receiverId,
          callType: data.callType,
        });
      }
    });

    socket.on("rejectCall", (data) => {
      const callerSocketId = onlineUsers.get(String(data.callerId));
      if (callerSocketId) {
        io.to(callerSocketId).emit("callRejected", {
          receiverId: data.receiverId,
        });
      }
    });

    socket.on("endCall", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("callEnded", {
          callerId: data.callerId,
        });
      }
    });

    // WEBRTC SIGNALING
    socket.on("webrtcOffer", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("webrtcOffer", data);
      }
    });

    socket.on("webrtcAnswer", (data) => {
      const callerSocketId = onlineUsers.get(String(data.callerId));
      if (callerSocketId) {
        io.to(callerSocketId).emit("webrtcAnswer", data);
      }
    });

    socket.on("iceCandidate", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("iceCandidate", data);
      }
    });

    // USER DISCONNECT
    socket.on("disconnect", async () => {
      try {
        for (const [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);
            await User.findByIdAndUpdate(userId, { isOnline: false });
            console.log("User offline:", userId);

            // Broadcast updated online list to everyone
            io.emit("onlineUsers", Array.from(onlineUsers.keys()));
            break;
          }
        }
      } catch (error) {
        console.log("Disconnect error:", error);
      }
    });
  });
};

module.exports = socketHandler;