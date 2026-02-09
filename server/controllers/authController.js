const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  PASSWORD_RESET_TEMPLATE,
  TWO_FACTOR_LOGIN_TEMPLATE,
  OTP_VERIFICATION_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} = require("../config/emailTemplate");
const sgMail = require("../config/sendgrid");
const Expense = require("../models/Expense");
const Group = require("../models/Group");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Helper function to send emails using SendGrid
const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: process.env.SENDER_EMAIL,
      subject,
      html,
    };

    await sgMail.send(msg);
    if (process.env.NODE_ENV === 'development') console.log(`✅ Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ SendGrid Error:`, error.response?.body || error.message);
    return false;
  }
};

// @desc    Send registration OTP
// @route   POST /api/auth/send-registration-otp
// @access  Public
exports.sendRegistrationOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate 6-digit OTP
    const OTP = String(Math.floor(100000 + Math.random() * 900000));

    // Create temporary unverified user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store registration data temporarily in user document
    let tempUser = await User.findOne({ email, isVerified: false });

    if (tempUser) {
      // Update existing unverified user
      tempUser.name = name;
      tempUser.password = hashedPassword;
      tempUser.registrationOtp = OTP;
      tempUser.registrationOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      await tempUser.save();
    } else {
      // Create new temporary user
      tempUser = await User.create({
        name,
        email,
        password: hashedPassword,
        registrationOtp: OTP,
        registrationOtpExpireAt: Date.now() + 10 * 60 * 1000,
        isVerified: false,
      });
    }

    // Send OTP email
    const emailSent = await sendEmail(
      email,
      "Verify Your Email - SmartSplit",
      OTP_VERIFICATION_TEMPLATE(OTP, name),
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      data: {
        email: email,
      },
    });
  } catch (error) {
    console.error("Send registration OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify registration OTP and complete registration
// @route   POST /api/auth/verify-registration-otp
// @access  Public
exports.verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find unverified user
    const user = await User.findOne({ email, isVerified: false });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Registration not found or already verified",
      });
    }

    // Verify OTP
    if (!user.registrationOtp || user.registrationOtp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Check if OTP expired
    if (user.registrationOtpExpireAt < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.registrationOtp = "";
    user.registrationOtpExpireAt = 0;
    await user.save();

    // Send welcome email
    await sendEmail(
      user.email,
      "Welcome to SmartSplit! 🎉",
      WELCOME_EMAIL_TEMPLATE(user.name),
    );

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Email verified successfully! Welcome to SmartSplit",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    console.error("Verify registration OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Resend registration OTP
// @route   POST /api/auth/resend-registration-otp
// @access  Public
exports.resendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find unverified user
    const user = await User.findOne({ email, isVerified: false });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Registration not found or already verified",
      });
    }

    // Generate new OTP
    const OTP = String(Math.floor(100000 + Math.random() * 900000));

    user.registrationOtp = OTP;
    user.registrationOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email
    const emailSent = await sendEmail(
      user.email,
      "New Verification Code - SmartSplit",
      OTP_VERIFICATION_TEMPLATE(OTP, user.name),
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.json({
      success: true,
      message: "New verification code sent to your email",
    });
  } catch (error) {
    console.error("Resend registration OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Register new user (DEPRECATED - Use sendRegistrationOtp instead)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  // Redirect to new OTP-based registration
  return res.status(400).json({
    success: false,
    message: "Please use /api/auth/send-registration-otp to register",
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // CHECK IF 2FA IS ENABLED
    if (user.twoFactorEnabled) {
      const OTP = String(Math.floor(100000 + Math.random() * 900000));

      user.twoFactorOtp = OTP;
      user.twoFactorOtpExpireAt = Date.now() + 10 * 60 * 1000;
      await user.save();

      const emailSent = await sendEmail(
        user.email,
        "Login Verification Code - SmartSplit",
        TWO_FACTOR_LOGIN_TEMPLATE(
          OTP,
          user.name,
          req.headers["user-agent"] || "Unknown Device",
        ),
      );

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to send verification code. Please try again.",
        });
      }

      return res.json({
        success: true,
        requiresTwoFactor: true,
        message: "Verification code sent to your email",
        data: {
          email: user.email,
          userId: user._id,
        },
      });
    }

    // IF 2FA NOT ENABLED, LOGIN DIRECTLY
    const token = generateToken(user._id);

    res.json({
      success: true,
      requiresTwoFactor: false,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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

exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email Required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = OTP;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const emailSent = await sendEmail(
      user.email,
      "Reset Your Password - SmartSplit",
      PASSWORD_RESET_TEMPLATE(OTP, user.name, 15),
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: "Password Reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Reset OTP error:", error);
    return res.json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Please provide email, OTP, and new password",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyTwoFactorOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "Two-factor authentication is not enabled",
      });
    }

    if (!user.twoFactorOtp || user.twoFactorOtp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (user.twoFactorOtpExpireAt < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    user.twoFactorOtp = "";
    user.twoFactorOtpExpireAt = 0;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.toggleTwoFactor = async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid boolean value for enabled",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.twoFactorEnabled = enabled;
    user.twoFactorOtp = "";
    user.twoFactorOtpExpireAt = 0;

    await user.save();

    res.json({
      success: true,
      message: `Two-factor authentication ${enabled ? "enabled" : "disabled"} successfully`,
      data: {
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTwoFactorStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resendTwoFactorOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "Two-factor authentication is not enabled",
      });
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000));

    user.twoFactorOtp = OTP;
    user.twoFactorOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const emailSent = await sendEmail(
      user.email,
      "SmartSplit - New Login Verification Code",
      TWO_FACTOR_LOGIN_TEMPLATE(OTP, user.name, "Resend Request"),
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again.",
      });
    }

    res.json({
      success: true,
      message: "New verification code sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.setMonthlyBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;

    if (monthlyBudget === undefined || monthlyBudget === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide a monthly budget",
      });
    }

    if (monthlyBudget < 0) {
      return res.status(400).json({
        success: false,
        message: "Budget cannot be negative",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.monthlyBudget = monthlyBudget;
    await user.save();

    res.json({
      success: true,
      message: "Monthly budget updated successfully",
      data: {
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMonthlyBudget = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        monthlyBudget: user.monthlyBudget || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "Please provide an avatar image",
      });
    }

    if (!avatar.startsWith("data:image/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format",
      });
    }

    const sizeInMB = (avatar.length * 3) / 4 / (1024 * 1024);
    if (sizeInMB > 7) {
      return res.status(400).json({
        success: false,
        message: "Image size is too large. Please use an image less than 5MB",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.avatar = avatar;
    await user.save();

    res.json({
      success: true,
      message: "Avatar updated successfully",
      data: {
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.avatar = "https://via.placeholder.com/150";
    await user.save();

    res.json({
      success: true,
      message: "Avatar removed successfully",
      data: {
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error removing avatar:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (phone && phone.trim()) {
      const phoneRegex = /^[0-9\s\+\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid phone number",
        });
      }
    }

    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name;
    user.email = email;
    user.phone = phone?.trim() || "";
    user.bio = bio?.trim() || "";
    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPrivacySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const privacySettings = user.privacySettings || {
      profileVisibility: true,
      activitySharing: false,
      dataCollection: true,
      marketingEmails: false,
    };

    res.json({
      success: true,
      data: privacySettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePrivacySettings = async (req, res) => {
  try {
    const {
      profileVisibility,
      activitySharing,
      dataCollection,
      marketingEmails,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.privacySettings = {
      profileVisibility:
        profileVisibility !== undefined ? profileVisibility : true,
      activitySharing: activitySharing !== undefined ? activitySharing : false,
      dataCollection: dataCollection !== undefined ? dataCollection : true,
      marketingEmails: marketingEmails !== undefined ? marketingEmails : false,
    };

    await user.save();

    res.json({
      success: true,
      message: "Privacy settings updated successfully",
      data: user.privacySettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Expense.deleteMany({
      $or: [{ paidBy: userId }, { "splits.user": userId }],
    });

    await Group.updateMany(
      { "members.user": userId },
      { $pull: { members: { user: userId } } },
    );

    const userGroups = await Group.find({ createdBy: userId });
    for (const group of userGroups) {
      if (group.members.length <= 1) {
        await Group.findByIdAndDelete(group._id);
      } else {
        const newCreator = group.members.find(
          (m) => m.user.toString() !== userId,
        );
        if (newCreator) {
          group.createdBy = newCreator.user;
          await group.save();
        }
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
