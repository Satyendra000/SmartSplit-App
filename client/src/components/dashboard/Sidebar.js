import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Users,
  PieChart,
  Settings,
  Lightbulb,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/personal" },
  { icon: Receipt, label: "Expenses", path: "/dashboard/expenses" },
  { icon: Users, label: "Groups", path: "/dashboard/groups" },
  { icon: PieChart, label: "Reports", path: "/dashboard/reports" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const tips = [
  "Money does not buy you happiness, but lack of money certainly buys you misery.",
  "The best time to start saving was yesterday. The second-best time is now.",
  "Periodically challenge yourself to live on a bare-bones budget (no takeout, no new clothes, etc.) for a month. This practice builds gratitude, creativity, and discipline, reinforcing the habit of saving.",
  "For non-essential items, institute a rule: wait a specific period (e.g., 7 or 30 days) before purchasing it. Often, the urge to buy the item passes, saving you money on impulse purchases.",
  "Ten percent of all you earn is yours to keep.",
];

const DashboardSidebar = ({
  userName = "Alex Doe",
  userEmail = "alex@example.com",
  avatar,
  Index,
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "/auth";
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Check if avatar is valid (not empty, not placeholder, and not errored)
  const hasValidAvatar =
    avatar &&
    avatar.trim() !== "" &&
    !avatar.includes("placeholder") &&
    !imageError;

  // Get user initials for fallback
  const getUserInitials = () => {
    if (!userName || userName.trim() === "") return "?";

    const nameParts = userName.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#0f0f0f] border border-white/10 rounded-lg text-white hover:bg-white/5 transition-all shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* User Profile */}
        <div className="p-4 sm:p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-orange-500/30 flex-shrink-0">
              {hasValidAvatar ? (
                <img
                  src={avatar}
                  alt={userName}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                  {userName && userName.trim() !== "" ? (
                    <span className="font-semibold text-sm">
                      {getUserInitials()}
                    </span>
                  ) : (
                    <User className="w-5 h-5" strokeWidth={2} />
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate text-sm sm:text-base">
                {userName}
              </p>
              <p className="text-xs sm:text-sm text-white/50 truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <item.icon
                  className="w-5 h-5 flex-shrink-0"
                  strokeWidth={1.5}
                />
                <span className="font-medium text-sm sm:text-base">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Pro Tip */}
        <div className="p-3 sm:p-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-orange-500 text-xs sm:text-sm font-semibold">
                Pro Tip
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              {tips[Index]}
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 sm:p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg w-full text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            <span className="font-medium text-sm sm:text-base">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
