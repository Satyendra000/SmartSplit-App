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

// Notify participants about settlement
router.post("/:id/notify", async (req, res) => {
  try {
    const { id } = req.params;
    const { settlements, participantEmails } = req.body;

    if (process.env.NODE_ENV === "development") {
      console.log("📧 Notify request received:", { id, settlementsCount: settlements?.length, emailsCount: participantEmails?.length });
    }

    const session = await Session.findOne({ id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (!settlements || !Array.isArray(settlements)) {
      return res.status(400).json({
        success: false,
        message: "Invalid settlements data",
      });
    }

    if (!participantEmails || participantEmails.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No email addresses provided",
      });
    }

    // Filter settlements where the debtor has an email
    const notifications = settlements.filter((settlement) => {
      const debtorEmailObj = participantEmails.find(
        (p) => p.name === settlement.from
      );
      return debtorEmailObj && debtorEmailObj.email;
    });

    if (notifications.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No participants with emails to notify",
      });
    }

    const { SETTLEMENT_NOTIFICATION_TEMPLATE } = require("../config/emailTemplate");
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Send emails
    const emailPromises = notifications.map(async (note) => {
      const debtor = participantEmails.find((p) => p.name === note.from);
      
      // Double-check debtor exists and has email
      if (!debtor || !debtor.email) {
        console.warn(`⚠️ Skipping notification for ${note.from} - no email found`);
        return Promise.resolve();
      }
      
      const msg = {
        to: debtor.email,
        from: process.env.SENDER_EMAIL,
        subject: `Settlement Reminder from ${session.groupName}`,
        html: SETTLEMENT_NOTIFICATION_TEMPLATE(
          debtor.name,
          note.amount.toFixed(2),
          note.to,
          session.groupName,
          session.id
        ),
      };

      if (process.env.NODE_ENV === "development") {
        console.log(`📧 Sending settlement email to ${debtor.email} for ₹${note.amount}`);
      }
      return sgMail.send(msg);
    });

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: `Sent ${notifications.length} reminder email(s)`,
    });

  } catch (error) {
    console.error("❌ Error sending notifications:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to send notifications",
      error: error.message,
    });
  }
});

module.exports = router;