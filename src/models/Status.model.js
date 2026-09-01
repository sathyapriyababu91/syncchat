const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  mediaUrl: {
    type: String,
    default: "",
  },

  caption: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // 24 hours TTL
  },
});

module.exports = mongoose.model("Status", statusSchema);