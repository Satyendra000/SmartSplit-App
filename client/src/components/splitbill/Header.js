import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Share2, Check } from "lucide-react";
import Navbar from "./Navbar";
import Logo from "./Logo";

const Header = ({ activeTab, setActiveTab, toast }) => {
  const location = useLocation();
  const [showCopied, setShowCopied] = useState(false);

  // Check if we're in a session
  const urlParams = new URLSearchParams(location.search);
  const sessionId = urlParams.get("session");

  const handleShareLink = async () => {
    if (sessionId) {
      const link = `${window.location.origin}/dashboard/split?session=${sessionId}`;

      try {
        await navigator.clipboard.writeText(link);
        setShowCopied(true);
        toast.success("Share link copied to clipboard!");
        setTimeout(() => setShowCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy link. Please try again.");
      }
    } else {
      toast.error("No session ID found to share");
    }
  };

  return (
    <header className="relative bg-white/5 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-4 transition-colors duration-300">
      {/* Subtle glow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>

      <div
        className="
      flex flex-col sm:flex-row 
      items-start sm:items-center 
      justify-between 
      gap-4 sm:gap-0
    "
      >
        {/* Logo */}
        <Logo />

        {/* Right Section */}
        <div
          className="
        flex flex-col sm:flex-row 
        items-stretch sm:items-center 
        gap-3 sm:gap-4 
        w-full sm:w-auto
      "
        >
          {/* Share Link Button */}
          {sessionId && (
            <div className="relative w-full sm:w-auto">
              <button
                onClick={handleShareLink}
                className="
              flex items-center justify-center sm:justify-start gap-2 
              px-4 py-2.5 
              bg-gradient-to-r from-orange-500 to-orange-600 
              hover:from-orange-600 hover:to-orange-700 
              text-white rounded-lg font-medium text-sm 
              transition-all shadow-lg shadow-orange-500/20 
              hover:shadow-xl hover:shadow-orange-500/30
              w-full sm:w-auto
            "
              >
                {showCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share Link
                  </>
                )}
              </button>

              {/* Tooltip (desktop only hover) */}
              {!showCopied && (
                <div className="hidden sm:block absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                    Click to copy shareable link
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="w-full sm:w-auto">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
