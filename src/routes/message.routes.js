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

// 1. UNREAD MESSAGE COUNT (MUST be placed before /:userId)
router.get("/unread/:userId", authMiddleware, getUnreadCount);

// 2. MARK AS READ
router.put("/read/:userId", authMiddleware, markMessagesAsRead);

// 3. SEND MESSAGE
router.post(
  "/send",
  authMiddleware,
  upload.single("audio"),
  sendMessage
);

// 4. CALL HISTORY ROUTES 
router.post(
  "/call-history",
  authMiddleware,
  saveCallHistory
);

router.get(
  "/call-history",
  authMiddleware,
  getCallHistory
);

// 5. DYNAMIC ROUTE (MUST be at the very bottom)
router.get("/:userId", authMiddleware, getMessages);

module.exports = router;