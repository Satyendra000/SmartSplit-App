const { createTransport } = require("nodemailer");

console.log('📧 Email Config Check:');
console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Missing');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set (length: ' + process.env.SMTP_PASS?.length + ')' : '❌ Missing');

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,           // Changed from 587 to 465
  secure: true,        // Changed from false to true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Configuration Error:', error.message);
    console.log('Check your SMTP_USER and SMTP_PASS environment variables');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

module.exports = transporter;
