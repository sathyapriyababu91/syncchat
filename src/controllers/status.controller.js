const Status = require("../models/Status.model");


// CREATE STATUS


const createStatus = async (req, res) => {
  try {
    const { caption } = req.body;

    const userId = req.user.userId;

    // Remove extra spaces
    const cleanCaption = caption?.trim() || "";

    // Media is optional
    let mediaUrl = "";

    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
    }

    // At least text OR media must exist
    if (!req.file && !cleanCaption) {
      return res.status(400).json({
        message: "Please add text or media to your status",
      });
    }

    const newStatus = new Status({
      userId,
      mediaUrl,
      caption: cleanCaption,
    });

    await newStatus.save();

    res.status(201).json({
      message: "Status uploaded successfully",
      newStatus,
    });

  } catch (error) {
    console.error("Upload status error:", error);

    res.status(500).json({
      message: "Failed to upload status",
    });
  }
};



// GET ALL STATUSES


const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find()
      .populate("userId", "name profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      statuses,
    });

  } catch (error) {
    console.error("Get status error:", error);

    res.status(500).json({
      message: "Failed to fetch statuses",
    });
  }
};


// ========================================
// DELETE STATUS
// ========================================

const deleteStatus = async (req, res) => {
  try {
    const { statusId } = req.params;

    const userId = req.user.userId;

    const status = await Status.findById(statusId);

    if (!status) {
      return res.status(404).json({
        message: "Status not found",
      });
    }

    // Only status owner can delete
    if (status.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized to delete this status",
      });
    }

    await Status.findByIdAndDelete(statusId);

    res.status(200).json({
      message: "Status deleted successfully",
    });

  } catch (error) {
    console.error("Delete status error:", error);

    res.status(500).json({
      message: "Failed to delete status",
    });
  }
};


module.exports = {
  createStatus,
  getStatuses,
  deleteStatus,
};