const sgMail = require("@sendgrid/mail");

if (process.env.NODE_ENV === "development") {
  console.log("📧 SendGrid Config Check:");
  console.log(
    "SENDGRID_API_KEY:",
    process.env.SENDGRID_API_KEY ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "SENDER_EMAIL:",
    process.env.SENDER_EMAIL ? "✅ Set" : "❌ Missing"
  );
}

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  if (process.env.NODE_ENV === "development") console.log("✅ SendGrid is ready");
} else {
  console.error("❌ SENDGRID_API_KEY is not set!");
}

module.exports = sgMail;
