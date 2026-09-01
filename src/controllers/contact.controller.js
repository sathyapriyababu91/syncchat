const Contact = require("../models/contact.model");
const User = require("../models/user.model");

// Send Friend Request
const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    if (req.user.userId === receiverId) {
      return res.status(400).json({ message: "You cannot send request to yourself" });
    }

    const existingRequest = await Contact.findOne({
      $or: [
        { sender: req.user.userId, receiver: receiverId },
        { sender: receiverId, receiver: req.user.userId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already exists or contact already added" });
    }

    const request = await Contact.create({
      sender: req.user.userId,
      receiver: receiverId,
    });

    const populatedRequest = await Contact.findById(request._id)
      .populate("sender", "name phone profilePic bio")
      .populate("receiver", "name phone profilePic bio");

    res.status(201).json({
      message: "Friend request sent",
      request: populatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept Friend Request
const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Contact.findOneAndUpdate(
      {
        _id: requestId,
        receiver: req.user.userId,
        status: "pending",
      },
      { status: "accepted" },
      { new: true }
    )
      .populate("sender", "name phone profilePic bio")
      .populate("receiver", "name phone profilePic bio");

    if (!request) {
      return res.status(404).json({ message: "Request not found or already processed" });
    }

    res.status(200).json({
      message: "Request accepted",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject Friend Request
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Contact.findOneAndDelete({
      _id: requestId,
      receiver: req.user.userId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Contacts List
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({
      $or: [{ sender: req.user.userId }, { receiver: req.user.userId }],
      status: "accepted",
    })
      .populate("sender", "name phone profilePic bio")
      .populate("receiver", "name phone profilePic bio");

    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove Contact using contact User ID
const removeContact = async (req, res) => {
  try {
    const { contactUserId } = req.body;

    if (!contactUserId) {
      return res.status(400).json({ message: "Contact user ID is required" });
    }

    const contact = await Contact.findOne({
      $or: [
        { sender: req.user.userId, receiver: contactUserId },
        { sender: contactUserId, receiver: req.user.userId },
      ],
      status: "accepted",
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await Contact.findByIdAndDelete(contact._id);

    res.status(200).json({ message: "Contact removed successfully" });
  } catch (error) {
    console.error("Remove contact error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Pending Friend Requests
const getPendingRequests = async (req, res) => {
  try {
    const requests = await Contact.find({
      receiver: req.user.userId,
      status: "pending",
    })
      .populate("sender", "name phone profilePic bio")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Contact using Contact Document ID
const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findOne({
      _id: contactId,
      $or: [{ sender: req.user.userId }, { receiver: req.user.userId }],
      status: "accepted",
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await Contact.findByIdAndDelete(contactId);

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getContacts,
  getPendingRequests,
  removeContact,
  deleteContact,
};