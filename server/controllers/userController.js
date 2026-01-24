const mongoose = require("mongoose");
const User = require("../models/User")
// @desc    Search users by email
// @route   GET /api/users/search?email=xxx
exports.searchUser = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email to search",
      });
    }

    // Trim and lowercase the email for consistent searching
    const searchEmail = email.trim().toLowerCase();

    if (process.env.NODE_ENV === 'development')
      console.log("Searching for user with email:", searchEmail);

    const user = await User.findOne({
      email: searchEmail,
    }).select("name email avatar phone");

    if (!user) {
      console.log("No user found with email:", searchEmail);
      return res.status(404).json({
        success: false,
        message: "User not found with this email address",
      });
    }

    if (process.env.NODE_ENV === "development")
      console.log("User found:", user);

    res.json({
      success: true,
      data: user,
      message: "User found successfully",
    });
  } catch (error) {
    console.error("Error in searchUser:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users (for admin or searching)
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query).select("name email avatar").limit(20);

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name email avatar phone",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    // Only allow user to update their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, avatar },
      { new: true, runValidators: true },
    ).select("name email avatar phone");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};