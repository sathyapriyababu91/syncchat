const User = require("../models/user.model");

// Helper function to escape special regex characters (e.g., +, *, ?, etc.)
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// Search Users Controller
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.keyword || req.query.query || req.query.name || "";
    const currentUserId = req.user?.userId;

    if (!keyword.trim()) {
      return res.status(200).json({ success: true, users: [] });
    }

    const cleanKeyword = keyword.trim().replace(/\s+/g, "");

    // Phone format +91 auto-append if digits only
    let formattedPhoneQuery = cleanKeyword;
    if (/^\d+$/.test(cleanKeyword) && !cleanKeyword.startsWith("+91")) {
      formattedPhoneQuery = `+91${cleanKeyword}`;
    }

    // Safe escaped queries for Regex search
    const safeKeyword = escapeRegex(keyword.trim());
    const safeCleanKeyword = escapeRegex(cleanKeyword);
    const safeFormattedPhone = escapeRegex(formattedPhoneQuery);

    const searchQuery = {
      $or: [
        { name: { $regex: safeKeyword, $options: "i" } },
        { phone: { $regex: safeCleanKeyword, $options: "i" } },
        { phone: { $regex: safeFormattedPhone, $options: "i" } },
      ],
    };

    if (currentUserId) {
      searchQuery._id = { $ne: currentUserId };
    }

    const users = await User.find(searchQuery).select("_id name phone profilePic bio");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to search users",
    });
  }
};

module.exports = {
  searchUsers,
};