const express = require("express");
const router = express.Router();
const Session = require("../models/Session");

// Create a new session
router.post("/create", async (req, res) => {
  try {
    const { id, groupName, participants, durationDays } = req.body;

    // Validate input
    if (!id || !groupName || !participants || !durationDays) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Participants must be a non-empty array",
      });
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Create session
    const session = new Session({
      id,
      groupName,
      participants,
      expenses: [],
      settledPayments: [],
      expiresAt,
      durationDays,
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: {
        id: session.id,
        groupName: session.groupName,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error creating session:", error);

    // Handle duplicate session ID
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Session ID already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create session",
      error: error.message,
    });
  }
});

// Get session by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({ id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      // Delete expired session
      await Session.deleteOne({ id });
      return res.status(410).json({
        success: false,
        message: "Session has expired",
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session",
      error: error.message,
    });
  }
});

// Update session (add expenses, settlements)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { expenses, settledPayments } = req.body;

    const session = await Session.findOne({ id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      await Session.deleteOne({ id });
      return res.status(410).json({
        success: false,
        message: "Session has expired",
      });
    }

    // Update session data
    if (expenses !== undefined) {
      session.expenses = expenses;
    }

    if (settledPayments !== undefined) {
      session.settledPayments = settledPayments;
    }

    session.lastModified = new Date();
    await session.save();

    res.json({
      success: true,
      message: "Session updated successfully",
      data: session,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update session",
      error: error.message,
    });
  }
});

// Delete session
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Session.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete session",
      error: error.message,
    });
  }
});

// List all active sessions (optional - for admin/debugging)
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find({
      expiresAt: { $gt: new Date() },
    }).select("id groupName participants createdAt expiresAt");

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Error listing sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list sessions",
      error: error.message,
    });
  }
});

module.exports = router;