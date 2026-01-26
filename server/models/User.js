const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  },
  monthlyBudget: {
    type: Number,
    default: 0,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false, // Don't return password by default
  },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  registrationOtp: {
    type: String,
    default: "",
  },
  registrationOtpExpireAt: {
    type: Number,
    default: 0,
  },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorOtp: {
    type: String,
    default: "",
  },
  twoFactorOtpExpireAt: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  phone: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  privacySettings: {
    type: {
      profileVisibility: { type: Boolean, default: true },
      activitySharing: { type: Boolean, default: false },
      dataCollection: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
    default: {
      profileVisibility: true,
      activitySharing: false,
      dataCollection: true,
      marketingEmails: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.index({ email: 1 });
UserSchema.index({ name: "text" });

module.exports = mongoose.model("User", UserSchema);
