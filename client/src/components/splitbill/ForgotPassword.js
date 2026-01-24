import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../common/ConfirmModal";
import API_URL from "../../config/api";
import {
  Wallet,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Key,
} from "lucide-react";
import Footer from "../common/Footer";

const ForgotPassword = ({ toast }) => {
  const { confirm, ConfirmModal } = useConfirm();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/auth/send-reset-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("OTP sent to your email. Please check your inbox.");
        setStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
            newPassword: formData.newPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/auth"), 2000);
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      toast.error("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    if (step > 1) {
      confirm({
        title: "Go Back?",
        message:
          "Are you sure you want to go back? Your progress will be lost.",
        confirmText: "Yes, Go Back",
        cancelText: "Stay Here",
        type: "warning",
        onConfirm: () => {
          setStep(step - 1);
          setError("");
          setSuccess("");
        },
      });
    } else {
      if (formData.email) {
        confirm({
          title: "Leave Page?",
          message:
            "Any unsaved information will be lost. Are you sure you want to go back to login?",
          confirmText: "Yes, Leave",
          cancelText: "Stay",
          type: "warning",
          onConfirm: () => navigate("/auth"),
        });
      } else {
        navigate("/auth");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-xl"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-2xl shadow-orange-500/20 flex items-center justify-center">
                  <Wallet className="w-9 h-9 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Smart<span className="text-orange-500">Split</span>
            </h1>
            <p className="text-white/50 text-sm">Reset your password</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl p-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step >= stepNum
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded transition-all ${
                        step > stepNum ? "bg-orange-500" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Success/Error Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-400">{success}</p>
              </div>
            )}

            {/* Step 1: Enter Email */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Forgot Password?
                  </h2>
                  <p className="text-white/50 text-sm">
                    Enter your email to receive an OTP
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@company.com"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/20"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <Mail className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2 & 3: Enter OTP and New Password */}
            {(step === 2 || step === 3) && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Reset Password
                  </h2>
                  <p className="text-white/50 text-sm">
                    Enter the OTP sent to {formData.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    OTP Code
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) =>
                        setFormData({ ...formData, otp: e.target.value })
                      }
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      minLength={6}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      minLength={6}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/20"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back Button */}
            <div className="mt-6">
              <button
                onClick={handleBackNavigation}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                {step > 1 ? "Back" : "Back to login"}
              </button>
            </div>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            Remembered your password?{" "}
            <button
              onClick={() => navigate("/auth")}
              className="text-orange-500 hover:text-orange-400 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
      <Footer />
      <ConfirmModal />
    </>
  );
};

export default ForgotPassword;