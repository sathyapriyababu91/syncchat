const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth.middleware");

// CONTROLLERS (Updated to use phoneLogin instead of firebase/otp)
const {
  phoneLogin,
  changePassword,
} = require("../controllers/user.controller");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profile.controller");

const {
  searchUsers,
} = require("../controllers/search.controller");

const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getContacts,
  getPendingRequests,
  removeContact,
  deleteContact,
} = require("../controllers/contact.controller");

// AUTH ROUTES (Single clean route for Phone & Name login)
router.post("/phone-login", phoneLogin);
router.put("/change-password", authMiddleware, changePassword);

// PROFILE ROUTES
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, upload.single("profilePic"), updateProfile);

// SEARCH ROUTE
router.get("/search", authMiddleware, searchUsers);

// CONTACT ROUTES (Exact endpoints matching Frontend)
router.post("/contact/request", authMiddleware, sendRequest);
router.put("/contact/accept", authMiddleware, acceptRequest);
router.put("/contact/reject", authMiddleware, rejectRequest);
router.get("/contacts", authMiddleware, getContacts);
router.get("/contact/pending", authMiddleware, getPendingRequests);
router.delete("/contact/remove", authMiddleware, removeContact);
router.delete("/contact/:contactId", authMiddleware, deleteContact);

module.exports = router;