const sgMail = require("../config/sendgrid");

exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    console.log("📧 Attempting to send feedback email via SendGrid...");

    // Email to you (feedback notification)
    const feedbackMsg = {
      to: process.env.FEEDBACK_EMAIL || process.env.SENDER_EMAIL,
      from: process.env.SENDER_EMAIL, // Must be verified in SendGrid
      replyTo: email,
      subject: `SmartSplit Feedback: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
                      color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
            .label { font-weight: bold; color: #666; margin-bottom: 5px; }
            .value { color: #333; }
            .message-box { background: white; padding: 20px; border-left: 4px solid #f97316; 
                           margin-top: 20px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📧 New Feedback Received</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">SmartSplit Feedback System</p>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">👤 From:</div>
                <div class="value">${name}</div>
              </div>
              <div class="info-row">
                <div class="label">📧 Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="info-row">
                <div class="label">📝 Subject:</div>
                <div class="value">${subject}</div>
              </div>
              <div class="message-box">
                <div class="label">💬 Message:</div>
                <div class="value" style="white-space: pre-wrap;">${message}</div>
              </div>
              <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p>Sent via SmartSplit Feedback Form</p>
                <p>${new Date().toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Feedback from SmartSplit

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent on ${new Date().toLocaleString()}
      `,
    };

    await sgMail.send(feedbackMsg);
    console.log("✅ Feedback email sent via SendGrid");

    // Confirmation email to user
    const confirmationMsg = {
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: "Thank you for your feedback - SmartSplit",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✓ Feedback Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for taking the time to share your feedback with us! We've received your message and our team will review it shortly.</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #666;"><strong>Your Feedback:</strong></p>
                <p style="margin: 10px 0 0 0;">"${subject}"</p>
              </div>
              <p>We typically respond within 24-48 hours. If your feedback requires a response, we'll get back to you at <strong>${email}</strong>.</p>
              <p>Keep splitting smart! 🚀</p>
              <p style="color: #666; margin-top: 30px;">
                Best regards,<br>
                <strong>The SmartSplit Team</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(confirmationMsg);
    console.log("✅ Confirmation email sent to user via SendGrid");

    res.json({
      success: true,
      message: "Thank you! Your feedback has been sent successfully.",
    });
  } catch (error) {
    console.error("❌ Feedback submission error:", error);

    // SendGrid specific error handling
    if (error.response) {
      console.error("SendGrid Error Response:", error.response.body);
    }

    res.status(500).json({
      success: false,
      message: "Failed to send feedback. Please try again later.",
    });
  }
};