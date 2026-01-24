import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../components/common/ConfirmModal";
import {
  Wallet,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Key,
  RefreshCw,
} from "lucide-react";
import Footer from "../../components/common/Footer";

const Auth = ({ toast }) => {
  const { confirm, ConfirmModal } = useConfirm();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorOtp, setTwoFactorOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isLogin && !formData.name.trim()) {
      toast.error("Please enter your name");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // CHECK IF 2FA IS REQUIRED
        if (data.requiresTwoFactor) {
          setRequires2FA(true);
          setUserEmail(formData.email);
          setError("");
        } else {
          // Normal login flow
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("user", JSON.stringify(data.data));
          localStorage.setItem("userName", data.data.name);
          localStorage.setItem("userEmail", data.data.email);
          navigate("/dashboard/personal");
        }
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (err) {
      toast.error("Failed to connect. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA OTP Verification
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!twoFactorOtp.trim()) {
      toast.error("Please enter the verification code");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-2fa-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            otp: twoFactorOtp,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data));
        localStorage.setItem("userName", data.data.name);
        localStorage.setItem("userEmail", data.data.email);
        navigate("/dashboard/personal");
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch (err) {
      toast.error("Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend 2FA OTP
  const handleResend2FA = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/resend-2fa-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("New verification code sent to your email!");
      } else {
        toast.error(data.message || "Failed to resend code");
      }
    } catch (err) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBackToLogin = () => {
    confirm({
      title: "Cancel Verification?",
      message:
        "Are you sure you want to go back? You will need to login again.",
      confirmText: "Yes, Go Back",
      cancelText: "Stay Here",
      type: "warning",
      onConfirm: () => {
        setRequires2FA(false);
        setTwoFactorOtp("");
        setError("");
      },
    });
  };

  const handleBackToHome = () => {
    if (formData.email || formData.password || formData.name) {
      confirm({
        title: "Leave Page?",
        message:
          "Any unsaved information will be lost. Are you sure you want to go back to home?",
        confirmText: "Yes, Leave",
        cancelText: "Stay",
        type: "warning",
        onConfirm: () => navigate("/"),
      });
    } else {
      navigate("/");
    }
  };

  // IF 2FA IS REQUIRED, SHOW OTP FORM
  if (requires2FA) {
    return (
      <>
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
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
              <p className="text-white/50 text-sm">Two-factor authentication</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Verify Your Identity
                </h2>
                <p className="text-white/50 text-sm">
                  Enter the 6-digit code sent to {userEmail}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerify2FA} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={twoFactorOtp}
                      onChange={(e) => setTwoFactorOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all text-center text-2xl tracking-widest"
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
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handleResend2FA}
                  disabled={loading}
                  className="text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend Code
                </button>
                <button
                  onClick={handleBackToLogin}
                  className="text-sm text-white/60 hover:text-white font-medium transition-colors"
                >
                  Back to login
                </button>
              </div>
            </div>

            <p className="text-center text-white/30 text-xs mt-6">
              Code expires in 10 minutes
            </p>
          </div>
        </div>
        <Footer />
        <ConfirmModal />
      </>
    );
  }

  // NORMAL LOGIN/REGISTER FORM
  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
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
            <p className="text-white/50 text-sm">
              Professional expense management
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="flex border-b border-white/5">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  isLogin
                    ? "text-white bg-white/5 border-b-2 border-orange-500"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  !isLogin
                    ? "text-white bg-white/5 border-b-2 border-orange-500"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isLogin ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-white/50 text-sm">
                  {isLogin
                    ? "Enter your credentials to continue"
                    : "Fill in your details to get started"}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {/* Forgot Password Link - Only in Login Mode */}
                  {isLogin && (
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                  {!isLogin && (
                    <p className="mt-2 text-xs text-white/40">
                      Minimum 6 characters
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isLogin ? "Sign in to dashboard" : "Create account"}
                      </span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-[#0a0a0a] text-white/30 text-xs font-medium">
                    OR
                  </span>
                </div>
              </div>

              <button
                onClick={handleBackToHome}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-lg transition-all"
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ConfirmModal />
    </>
  );
};

export default Auth;