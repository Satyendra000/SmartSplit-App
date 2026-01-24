const express = require("express");
const router = express.Router();
const { submitFeedback } = require("../controllers/feedbackController");

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Public
router.post("/", submitFeedback);

module.exports = router;
