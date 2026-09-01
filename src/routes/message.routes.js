const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  sendMessage,
  getMessages,
  getUnreadCount,
  markMessagesAsRead,
  saveCallHistory,
  getCallHistory,
} = require("../controllers/message.controller");

const authMiddleware = require("../middleware/auth.middleware");

// UNREAD MESSAGE COUNT
router.get("/unread/:userId", authMiddleware, getUnreadCount);

router.put("/read/:userId", authMiddleware, markMessagesAsRead);

router.post(
  "/send",
  authMiddleware,
  upload.single("audio"),
  sendMessage
);

// CALL HISTORY ROUTES 
router.post(
  "/call-history",
  authMiddleware,
  saveCallHistory
);

// 2. GET Call History 
router.get(
  "/call-history",
  authMiddleware,
  getCallHistory
);

// DYNAMIC ROUTE
router.get("/:userId", authMiddleware, getMessages);

module.exports = router;