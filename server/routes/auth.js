const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  resetPassword,
  sendResetOtp,
  changePassword,
  verifyTwoFactorOtp,
  toggleTwoFactor,
  getTwoFactorStatus,
  resendTwoFactorOtp,
  setMonthlyBudget,
  getMonthlyBudget,
  setProfile,
  updateAvatar,
  removeAvatar,
  updateProfile,
  getPrivacySettings,
  updatePrivacySettings,
  deleteAccount,
} = require("../controllers/authController");
const { auth, protect } = require('../middlewares/auth');

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);

router.post('/send-reset-otp', sendResetOtp);
router.post('/reset-password', resetPassword);

router.put('/change-password', protect, changePassword);

router.post('/verify-2fa-otp', verifyTwoFactorOtp);
router.post('/resend-2fa-otp', resendTwoFactorOtp);

router.put('/toggle-2fa', protect, toggleTwoFactor);
router.get('/2fa-status', protect, getTwoFactorStatus);

router.get("/budget", protect, getMonthlyBudget);
router.put("/budget", protect, setMonthlyBudget);

router.put("/set-profile", protect, setProfile);

router.put("/update-avatar", protect, updateAvatar);
router.delete("/remove-avatar", protect, removeAvatar);

router.put("/update-profile", protect, updateProfile);
router.get("/privacy-settings", protect, getPrivacySettings);
router.put("/privacy-settings", protect, updatePrivacySettings);
router.delete("/delete-account", protect, deleteAccount);

module.exports = router;
