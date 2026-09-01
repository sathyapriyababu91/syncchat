const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Text message
    message: {
      type: String,
      default: "",
    },

    // Voice note
    audioUrl: {
      type: String,
      default: "",
    },

    // Message / Call
    type: {
  type: String,
  enum: ["text", "voice", "audio_call", "video_call"],
  default: "text",
},

    // Call status
   callStatus: {
  type: String,
  enum: ["completed", "missed", "rejected", "cancelled"],
  default: null,
},
    // Call duration in seconds
    callDuration: {
  type: Number,
  default: 0,
},

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);