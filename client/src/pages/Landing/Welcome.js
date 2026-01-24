import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  User,
  ArrowRight,
  Wallet,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import Footer from "../../components/common/Footer";

const Welcome = () => {
  const navigate = useNavigate();

  const handleChooseMode = (mode) => {
    if (mode === "split") {
      navigate("/split-setup");
    } else if (mode === "personal") {
      const token = localStorage.getItem("token");
      if (token) {
        navigate("/dashboard/personal");
      } else {
        navigate("/auth");
      }
    }
  };

  return (
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

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/20 flex items-center justify-center">
                <Wallet className="w-11 h-11 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <h1 className="text-6xl sm:text-7xl font-bold text-white mb-4 tracking-tight">
            Smart<span className="text-orange-500">Split</span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Split bills instantly. Track expenses effortlessly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-white/50">
              <Shield className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Industry-standard</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2 text-white/50">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm">100% Free Forever</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2 text-white/50">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Lightning Fast</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div
            onClick={() => handleChooseMode("split")}
            className="group relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden cursor-pointer transition-all duration-500 hover:bg-white/10 hover:border-orange-500/50 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>

            <div className="relative p-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/5 border border-white/10 rounded-xl mb-6 group-hover:bg-white/10 group-hover:border-orange-500/30 transition-all">
                <Users className="w-7 h-7 text-orange-500" strokeWidth={1.5} />
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">
                Quick Split
              </h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                Perfect for one-time events. Split restaurant bills, trips, or
                shared costs instantly. No signup required.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Create session in 10 seconds",
                  "Share link with friends instantly",
                  "Real-time expense tracking",
                  "Smart settlement calculator",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between text-orange-500 group-hover:text-orange-400 transition-colors">
                <span className="font-semibold">Start splitting</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div
            onClick={() => handleChooseMode("personal")}
            className="group relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden cursor-pointer transition-all duration-500 hover:bg-white/10 hover:border-orange-500/50 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full">
              <span className="text-xs text-orange-400 font-semibold">
                RECOMMENDED
              </span>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>

            <div className="relative p-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-6 group-hover:bg-orange-500/20 group-hover:border-orange-500/40 transition-all">
                <User className="w-7 h-7 text-orange-500" strokeWidth={1.5} />
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">
                Personal Dashboard
              </h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                Track all your expenses in one place. Get insights, set budgets,
                and never miss a payment.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Cloud sync across all devices",
                  "Beautiful spending analytics",
                  "Budget tracking & alerts",
                  "Multiple groups & categories",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between text-orange-500 group-hover:text-orange-400 transition-colors">
                <span className="font-semibold">Get started</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Welcome;