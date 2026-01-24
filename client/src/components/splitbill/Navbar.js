import { LayoutDashboard, BarChart3 } from "lucide-react";

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav
      className="
        flex flex-col sm:flex-row 
        items-stretch sm:items-center 
        gap-2 
        bg-white/5 backdrop-blur-xl 
        rounded-xl p-1 
        border border-white/10
        w-full sm:w-auto
      "
    >
      {/* Dashboard Button */}
      <button
        onClick={() => setActiveTab("groups")}
        className={`flex items-center justify-center sm:justify-start gap-2 
          px-4 py-3 sm:py-2.5 
          rounded-lg font-medium text-sm 
          transition-all duration-300
          w-full sm:w-auto
          ${
            activeTab === "groups"
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        Dashboard
      </button>

      {/* Reports Button */}
      <button
        onClick={() => setActiveTab("reports")}
        className={`flex items-center justify-center sm:justify-start gap-2 
          px-4 py-3 sm:py-2.5 
          rounded-lg font-medium text-sm 
          transition-all duration-300
          w-full sm:w-auto
          ${
            activeTab === "reports"
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
      >
        <BarChart3 className="w-4 h-4" />
        Reports
      </button>
    </nav>
  );
};

export default Navbar;