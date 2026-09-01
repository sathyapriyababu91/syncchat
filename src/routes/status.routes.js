const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth.middleware");
const { createStatus, getStatuses, deleteStatus } = require("../controllers/status.controller");
// Create Status
router.post("/create", authMiddleware, upload.single("media"), createStatus);

// Get All Statuses
router.get("/all", authMiddleware, getStatuses);
// Delete Status Route
router.delete("/delete/:statusId", authMiddleware, deleteStatus);

module.exports = router;