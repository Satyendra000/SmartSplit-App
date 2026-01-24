import React, { useState } from "react";
import API_URL from "../../config/api";
import {
  Wallet,
  Linkedin,
  Github,
  MapPin,
  Heart,
  MessageSquare,
  X,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://www.linkedin.com/in/satyendra-pratap-singh-67a9a028a/",
      color: "hover:bg-blue-600",
      hoverColor: "group-hover:text-blue-400",
    },
    {
      name: "GitHub",
      icon: Github,
      url: "https://github.com/Satyendra000",
      color: "hover:bg-gray-700",
      hoverColor: "group-hover:text-gray-300",
    },
  ];

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackForm),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus("success");
        setFeedbackForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => {
          setShowFeedbackModal(false);
          setSubmitStatus(null);
        }, 2000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      setSubmitStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFeedbackForm({
      ...feedbackForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <footer className="relative bg-gradient-to-b from-[#0a0a0a] to-black border-t border-white/5 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand & Description */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Wallet className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold">
                  <span className="text-white">Smart</span>
                  <span className="text-orange-500">Split</span>
                </h3>
              </div>
              <p className="text-white/60 leading-relaxed mb-6">
                The smartest way to split bills and track expenses. Built with
                ❤️ for modern expense management.
              </p>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>India</span>
              </div>
            </div>

            {/* Connect With Me */}
            <div className="md:col-span-1">
              <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                Connect With Me
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-transparent transition-all duration-300 hover:scale-105"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${social.gradient} opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300`}
                    ></div>
                    <social.icon
                      className="relative w-5 h-5 text-white/60 group-hover:text-white transition-colors"
                      strokeWidth={1.5}
                    />
                    <span className="relative text-sm text-white/60 group-hover:text-white transition-colors font-medium">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Feedback Section */}
            <div className="md:col-span-1">
              <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                Get In Touch
              </h4>
              <div className="space-y-4">
                <p className="text-white/60 text-sm leading-relaxed">
                  Have suggestions or found a bug? Your feedback helps us
                  improve SmartSplit for everyone.
                </p>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Feedback
                </button>
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span>Usually responds within 24 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div className="flex flex-col md:flex-row items-center gap-2 text-white/40 text-sm">
                <span>© {currentYear} SmartSplit. All rights reserved.</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  Crafted with{" "}
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" />{" "}
                </span>
              </div>

              {/* Tech Stack */}
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <span>Powered by</span>
                <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-cyan-400 font-mono">
                  React
                </span>
                <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-green-400 font-mono">
                  Node.js
                </span>
                <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-emerald-400 font-mono">
                  MongoDB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
      </footer>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl shadow-orange-500/10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Send Feedback
                  </h3>
                  <p className="text-sm text-white/50">
                    We'd love to hear from you
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60 hover:text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
              {submitStatus === "success" && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-400 font-medium">
                      Feedback sent successfully!
                    </p>
                    <p className="text-xs text-green-400/70 mt-1">
                      Thank you for helping us improve.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">
                    Failed to send feedback. Please try again.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={feedbackForm.subject}
                  onChange={handleInputChange}
                  placeholder="What's this about?"
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleInputChange}
                  placeholder="Tell us what you think..."
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
