const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  PASSWORD_RESET_TEMPLATE,
  TWO_FACTOR_LOGIN_TEMPLATE,
  OTP_VERIFICATION_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} = require("../config/emailTemplate");
const transporter = require("../config/nodeMailer");
const Expense = require("../models/Expense");
const Group = require("../models/Group");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const welcomeMail = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Welcome to SmartSplit! 🎉",
      html: WELCOME_EMAIL_TEMPLATE(user.name),
    };

    transporter
      .sendMail(welcomeMail)
      .catch((err) => console.error("Error sending welcome email:", err));

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ CHECK IF 2FA IS ENABLED
    if (user.twoFactorEnabled) {
      // Generate 6-digit OTP
      const OTP = String(Math.floor(100000 + Math.random() * 900000));

      user.twoFactorOtp = OTP;
      user.twoFactorOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      // Send OTP via email
      try {
        const otpMail = {
          from: process.env.SENDER_EMAIL,
          to: user.email,
          subject: "Login Verification Code - SmartSplit",
          html: TWO_FACTOR_LOGIN_TEMPLATE(
            OTP,
            user.name,
            req.headers["user-agent"] || "Unknown Device",
          ),
        };

        await transporter.sendMail(otpMail);

        return res.json({
          success: true,
          requiresTwoFactor: true,
          message: "Verification code sent to your email",
          data: {
            email: user.email,
            userId: user._id,
          },
        });
      } catch (emailError) {
        console.error("Error sending 2FA OTP:", emailError);
        return res.status(500).json({
          success: false,
          message: "Failed to send verification code. Please try again.",
        });
      }
    }

    // ✅ IF 2FA NOT ENABLED, LOGIN DIRECTLY
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

exports.sentVerifyOtp = async (req, res) => {
  try {
    const { userId } = req;
    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Acoount Already Verified" });
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = OTP;
    user.verifyOtpExpiryAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify Your Email - SmartSplit",
      html: OTP_VERIFICATION_TEMPLATE(OTP, user.name, 10), // 24 hours in minutes
    };

    await transporter.sendMail(mailOption);
    return res.json({
      success: true,
      message: "Verification OTP sent on Email",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { userId } = req;
  const { otp } = req.body;
  console.log(otp);
  const user = await userModel.findById(userId);
  if (!userId || !user.verifyOtp) {
    return res.json({
      success: false,
      message: "Missing Details",
    });
  }

  try {
    if (!user) {
      return res.json({
        success: false,
        message: "User Not Found",
      });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.verifyOtpExpiryAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiryAt = 0;

    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

exports.isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
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

    const resetMail = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Your Password - SmartSplit",
      html: PASSWORD_RESET_TEMPLATE(OTP, user.name, 15),
    };

    await transporter.sendMail(resetMail);
    return res.json({
      success: true,
      message: "Password Reset OTP sent to your email",
    });
  } catch (error) {
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

    // Hash new password
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

    // Get user with password field
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
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

exports.setMonthlyBudget = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const MonthlyBudget = req;

    user.monthlyBudget = MonthlyBudget;
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

    // Clear OTP after successful verification
    user.twoFactorOtp = "";
    user.twoFactorOtpExpireAt = 0;
    await user.save();

    // Generate token
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

    // Clear any existing OTP when toggling
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

    // Generate new OTP
    const OTP = String(Math.floor(100000 + Math.random() * 900000));

    user.twoFactorOtp = OTP;
    user.twoFactorOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP
    const otpMail = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "SmartSplit - New Login Verification Code",
      text: `Your new login verification code is: ${OTP}\n\nThis code will expire in 10 minutes.`,
    };

    await transporter.sendMail(otpMail);

    res.json({
      success: true,
      message: "New verification code sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.setMonthlyBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;

    // Validation
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

    // Update user's monthly budget
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

exports.setProfile = async (req, res) => {
  try {
    const { phone, bio } = req.body;

    const isTenDigits = /^\d{10}$/.test(phone);
    if (phone.length !== 10 || !isTenDigits) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Phone Number",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    user.phone = phone;
    if (bio.length != 0) {
      user.bio = bio;
    }

    await user.save();

    if (bio.length != 0)
      res.json({
        success: true,
        message: "Phone number & Bio added successfully",
        data: {
          phone: user.phone,
          bio: user.bio,
        },
      });
    else
      res.json({
        success: true,
        message: "Phone number added successfully",
        data: {
          phone: user.phone,
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

    // Validate base64 image
    if (!avatar.startsWith("data:image/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format",
      });
    }

    // Check image size (base64 is ~33% larger, so 5MB image = ~6.7MB base64)
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

    // Update avatar
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
    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Mongoose validation error:", error);
    }
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

    // Reset to default avatar
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

// Update user profile
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

    // Check if email is already taken
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

// Get privacy settings
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

// Update privacy settings
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

// Delete account permanently
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

    // Delete all user's expenses
    await Expense.deleteMany({
      $or: [{ paidBy: userId }, { "splits.user": userId }],
    });

    // Remove user from all groups
    await Group.updateMany(
      { "members.user": userId },
      { $pull: { members: { user: userId } } },
    );

    // Handle groups created by user
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

    // Delete the user account
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
