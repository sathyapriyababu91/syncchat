const Message = require("../models/message.model");
const { getIO } = require("../socket/socketInstance");

// Send Message (Text & Voice Note)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    let audioUrl = "";
    if (req.file) {
      audioUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const newMessage = await Message.create({
      sender: req.user.userId,
      receiver: receiverId,
      message: message || "🎤 [Voice Note]",
      audioUrl: audioUrl,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name phone profilePic")
      .populate("receiver", "name phone profilePic");

    const io = getIO();
    if (io) {
      io.to(receiverId).emit("receiveMessage", populatedMessage);
    }

    res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Chat History
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          sender: req.user.userId,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: req.user.userId,
        },
      ],
    })
      .populate("sender", "name phone profilePic")
      .populate("receiver", "name phone profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Unread Count
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Message.countDocuments({
      sender: userId,
      receiver: req.user.userId,
      isRead: false,
    });

    res.status(200).json({
      count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      message: "Failed to get unread count",
    });
  }
};

// Mark Messages as Read
const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    res.status(200).json({
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({
      message: "Failed to mark messages as read",
    });
  }
};

// Save Call History
const saveCallHistory = async (req, res) => {
  try {
    const { receiverId, type, callStatus, callDuration } = req.body;

    if (!receiverId || !type) {
      return res.status(400).json({
        message: "receiverId and type are required",
      });
    }

    if (!["audio_call", "video_call"].includes(type)) {
      return res.status(400).json({
        message: "Invalid call type",
      });
    }

    const newCall = await Message.create({
      sender: req.user.userId,
      receiver: receiverId,
      message: "",
      type,
      callStatus: callStatus || "completed",
      callDuration: callDuration || 0,
      isRead: true,
    });

    const populatedCall = await Message.findById(newCall._id)
      .populate("sender", "name phone profilePic")
      .populate("receiver", "name phone profilePic");

    const io = getIO();
    if (io) {
      io.to(receiverId).emit("receiveMessage", populatedCall);
    }

    res.status(201).json({
      message: "Call history saved",
      data: populatedCall,
    });
  } catch (error) {
    console.error("Save call history error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Call History 
const getCallHistory = async (req, res) => {
  try {
    const calls = await Message.find({
      $or: [
        { sender: req.user.userId },
        { receiver: req.user.userId }
      ],
      type: { $in: ["audio_call", "video_call"] }
    })
      .populate("sender", "name phone profilePic")
      .populate("receiver", "name phone profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      calls,
    });
  } catch (error) {
    console.error("Get call history error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUnreadCount,
  markMessagesAsRead,
  saveCallHistory,
  getCallHistory, 
};