const { createTransport } = require("nodemailer");

// Create a test account or replace with real credentials.
transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Configuration Error:", error.message);
    console.log("Check your SMTP_USER and SMTP_PASS environment variables");
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

module.exports = transporter;