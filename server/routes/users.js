const express = require("express");
const router = express.Router();
const {
  searchUser,
  getUsers,
  getUserById,
  updateUser,
} = require("../controllers/userController");
const { auth } = require("../middlewares/auth");

// Search user by email
router.get("/search",auth, searchUser);

// Get all users (with optional search)
router.get("/", auth, getUsers);

// Get user by ID
router.get("/:id", auth, getUserById);

// Update user
router.put("/:id", auth, updateUser);

module.exports = router;
