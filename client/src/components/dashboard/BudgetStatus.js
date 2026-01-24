import { useState, useEffect } from "react";
import { Target, Settings, AlertCircle, TrendingUp } from "lucide-react";

// Budget Status Card Component
export const BudgetStatusCard = ({ stats, onSetBudget, refreshTrigger }) => {
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudget();
  }, [refreshTrigger]);

  const fetchBudget = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/auth/budget", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMonthlyBudget(data.data.monthlyBudget || 0);
      }
    } catch (error) {
      console.error("Error fetching budget:", error);
    } finally {
      setLoading(false);
    }
  };

  const budgetUsed =
    monthlyBudget > 0 ? (stats.monthlySpending / monthlyBudget) * 100 : 0;
  const isOverBudget = budgetUsed > 100;
  const isNearLimit = budgetUsed > 80 && budgetUsed <= 100;

  const getStatusColor = () => {
    if (isOverBudget) return "text-red-500";
    if (isNearLimit) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusText = () => {
    if (monthlyBudget === 0) return "Set Budget";
    if (isOverBudget) return "Over Budget";
    if (isNearLimit) return "Near Limit";
    return "On Track";
  };

  const getStatusIcon = () => {
    if (monthlyBudget === 0) return Settings;
    if (isOverBudget) return AlertCircle;
    if (isNearLimit) return TrendingUp;
    return Target;
  };

  const StatusIcon = getStatusIcon();

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/5 hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-center h-20 sm:h-24">
          <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/5 hover:border-orange-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs sm:text-sm text-white/60 font-medium">
          Budget Status
        </span>
        <div
          className={`p-1.5 sm:p-2 rounded-lg ${
            monthlyBudget === 0
              ? "bg-gray-500/10"
              : isOverBudget
                ? "bg-red-500/10"
                : isNearLimit
                  ? "bg-yellow-500/10"
                  : "bg-green-500/10"
          }`}
        >
          <StatusIcon
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              monthlyBudget === 0 ? "text-gray-500" : getStatusColor()
            }`}
            strokeWidth={1.5}
          />
        </div>
      </div>

      <div className="space-y-2">
        {monthlyBudget > 0 ? (
          <>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-xl sm:text-2xl font-bold tracking-tight ${getStatusColor()}`}
              >
                {budgetUsed.toFixed(0)}%
              </p>
              <span className="text-xs sm:text-sm text-white/50">used</span>
            </div>

            <div className="relative h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                  isOverBudget
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : isNearLimit
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                      : "bg-gradient-to-r from-green-500 to-green-600"
                }`}
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              <span className="text-white/40">
                ₹{stats.monthlySpending.toFixed(0)} / ₹
                {monthlyBudget.toFixed(0)}
              </span>
            </div>

            {isOverBudget && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-[10px] sm:text-xs text-red-400">
                  Over by ₹{(stats.monthlySpending - monthlyBudget).toFixed(2)}
                </p>
              </div>
            )}

            {isNearLimit && !isOverBudget && (
              <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-[10px] sm:text-xs text-yellow-400">
                  ₹{(monthlyBudget - stats.monthlySpending).toFixed(2)}{" "}
                  remaining
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-white/40">
              --
            </p>
            <button
              onClick={onSetBudget}
              className="w-full mt-2 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-500 rounded-lg text-xs font-medium transition-all"
            >
              Set Monthly Budget
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Budget Settings Modal Component
export const BudgetSettingsModal = ({
  show,
  onClose,
  currentBudget,
  onSave,
  toast,
  confirm,
}) => {
  const [budget, setBudget] = useState(currentBudget || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setBudget(currentBudget || "");
    }
  }, [show, currentBudget]);

  const handleSave = async () => {
    const budgetValue = parseFloat(budget);

    if (isNaN(budgetValue) || budgetValue < 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/auth/budget", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ monthlyBudget: budgetValue }),
      });

      const data = await response.json();

      if (data.success) {
        onSave(budgetValue);
        onClose();
        toast.success("Monthly budget updated successfully!");
      } else {
        toast.error(data.message || "Failed to update budget");
      }
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Failed to update budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    confirm({
      title: "Remove Monthly Budget?",
      message:
        "Are you sure you want to remove your monthly budget? This will disable budget tracking.",
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");

          const response = await fetch(
            "http://localhost:5000/api/auth/budget",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ monthlyBudget: 0 }),
            },
          );

          const data = await response.json();

          if (data.success) {
            onSave(0);
            onClose();
            toast.success("Monthly budget removed successfully!");
          } else {
            toast.error(data.message || "Failed to remove budget");
          }
        } catch (error) {
          console.error("Error removing budget:", error);
          toast.error("Failed to remove budget. Please try again.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
          Set Monthly Budget
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
              Monthly Budget Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g., 50000"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
              autoFocus
            />
            <p className="text-[10px] sm:text-xs text-white/40 mt-2">
              Set a monthly spending limit to track your expenses
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[20000, 30000, 50000].map((amount) => (
              <button
                key={amount}
                onClick={() => setBudget(amount.toString())}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 text-white/70 hover:text-white rounded-lg transition-all"
              >
                ₹{(amount / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {currentBudget > 0 && (
            <button
              onClick={handleRemove}
              disabled={loading}
              className="px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all disabled:opacity-50 order-3 sm:order-1"
            >
              Remove
            </button>
          )}
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all disabled:opacity-50 order-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 order-1 sm:order-3"
          >
            {loading ? "Saving..." : "Save Budget"}
          </button>
        </div>
      </div>
    </div>
  );
};