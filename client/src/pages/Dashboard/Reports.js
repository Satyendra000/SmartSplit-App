import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Car,
  Tv,
  Zap,
  Coffee,
} from "lucide-react";
import DashboardSidebar from "../../components/dashboard/Sidebar";
import { expenseAPI } from "../../services/api";
import { MonthlyComparisonCard } from "../../components/dashboard/MonthlyComp";

const getRangeFilteredExpenses = (expenses, rangeKey) => {
  if (!expenses || expenses.length === 0) return [];

  const now = new Date();
  const msInDay = 1000 * 60 * 60 * 24;

  return expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    const diffDays = (now - expDate) / msInDay;

    if (rangeKey === "30d") return diffDays <= 30;
    if (rangeKey === "90d") return diffDays <= 90;
    if (rangeKey === "year") return expDate.getFullYear() === now.getFullYear();
    if (rangeKey === "all") return true;

    return true;
  });
};

const getMonthlySharedPersonalData = (expenses, rangeKey) => {
  const now = new Date();
  let months = [];

  if (rangeKey === "30d") {
    // Last 30 days - show last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const label = `W${4 - i}`;
      const key = `week-${i}`;
      months.push({ key, label, weekStart, weekEnd: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) });
    }
  } else if (rangeKey === "90d") {
    // Last 90 days - show last 3 months
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      months.push({ key, label, month: date.getMonth(), year: date.getFullYear() });
    }
  } else if (rangeKey === "year") {
    // This year - show all months
    const currentMonth = now.getMonth();
    for (let i = 0; i <= currentMonth; i++) {
      const date = new Date(now.getFullYear(), i, 1);
      const label = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      months.push({ key, label, month: i, year: now.getFullYear() });
    }
  } else if (rangeKey === "all") {
    // All time - show last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      months.push({ key, label, month: date.getMonth(), year: date.getFullYear() });
    }
  }

  const totals = {};
  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    let key;

    if (rangeKey === "30d") {
      // Find which week this expense belongs to
      const weekIndex = months.findIndex(m => expDate >= m.weekStart && expDate < m.weekEnd);
      if (weekIndex !== -1) {
        key = months[weekIndex].key;
      }
    } else {
      key = `${expDate.getFullYear()}-${expDate.getMonth()}`;
    }

    if (key && !totals[key]) {
      totals[key] = { shared: 0, personal: 0 };
    }
    
    if (key) {
      const amount = Number(exp.amount) || 0;
      if (exp.expenseType === "shared") {
        totals[key].shared += amount;
      } else {
        totals[key].personal += amount;
      }
    }
  });

  const data = months.map((m) => ({
    month: m.label,
    shared: totals[m.key]?.shared || 0,
    personal: totals[m.key]?.personal || 0,
  }));

  const maxShared = Math.max(...data.map((d) => d.shared), 1);
  const maxPersonal = Math.max(...data.map((d) => d.personal), 1);

  return { data, maxShared, maxPersonal };
};

const getCategoryBreakdownData = (expenses) => {
  const categories = {};

  expenses.forEach((exp) => {
    const cat = exp.category || "Other";
    const amount = Number(exp.amount) || 0;
    categories[cat] = (categories[cat] || 0) + amount;
  });

  const total = Object.values(categories).reduce((sum, v) => sum + v, 0);

  const colorMap = {
    Rent: "from-orange-500 to-orange-600",
    Food: "from-orange-500 to-orange-600",
    Groceries: "from-green-500 to-green-600",
    Transport: "from-blue-500 to-blue-600",
    Entertainment: "from-purple-500 to-purple-600",
    Bills: "from-yellow-500 to-yellow-600",
    Utilities: "from-emerald-500 to-emerald-600",
    Travel: "from-cyan-500 to-cyan-600",
    Shopping: "from-pink-500 to-pink-600",
    Other: "from-slate-500 to-slate-600",
  };

  const categoryData = Object.entries(categories).map(([name, value]) => ({
    name,
    value: total > 0 ? Math.round((value / total) * 100) : 0,
    amount: value,
    gradient: colorMap[name] || colorMap.Other,
  }));

  return categoryData.sort((a, b) => b.amount - a.amount);
};

const getTopMerchants = (expenses) => {
  const merchantsMap = {};

  expenses.forEach((exp) => {
    const name = exp.description || "Unknown";
    const category = exp.category || "Expense";
    const amount = Number(exp.amount) || 0;

    if (!merchantsMap[name]) {
      merchantsMap[name] = {
        name,
        category,
        amount: 0,
        transactions: 0,
      };
    }

    merchantsMap[name].amount += amount;
    merchantsMap[name].transactions += 1;
  });

  const merchants = Object.values(merchantsMap).sort(
    (a, b) => b.amount - a.amount
  );

  return merchants.slice(0, 5);
};

const getMerchantIconConfig = (category) => {
  const normalized = (category || "").toLowerCase();

  if (normalized.includes("grocery") || normalized.includes("food")) {
    return {
      icon: ShoppingCart,
      color: "bg-green-500/20 text-green-500",
    };
  }

  if (
    normalized.includes("uber") ||
    normalized.includes("cab") ||
    normalized.includes("transport")
  ) {
    return {
      icon: Car,
      color: "bg-orange-500/20 text-orange-500",
    };
  }

  if (normalized.includes("netflix") || normalized.includes("entertainment")) {
    return {
      icon: Tv,
      color: "bg-red-500/20 text-red-500",
    };
  }

  if (normalized.includes("bill") || normalized.includes("utility")) {
    return {
      icon: Zap,
      color: "bg-blue-500/20 text-blue-500",
    };
  }

  return {
    icon: Coffee,
    color: "bg-orange-500/20 text-orange-500",
  };
};

const Reports = ({toast}) => {
  const [expenses, setExpenses] = useState([]);
  const [selectedRange, setSelectedRange] = useState("30d");

  const userName = localStorage.getItem("userName") || "Alex";
  const userEmail = localStorage.getItem("userEmail") || "alex@example.com";
  const avatar = JSON.parse(localStorage.getItem("user")).avatar;

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await expenseAPI.getAll();
        if (response.data.success) {
          // Filter out group creation placeholder expenses
          const filteredExpenses = response.data.data.filter((expense) => {
            return !(expense.amount === 0.01 && expense.expenseType === "shared" && expense.splits?.length === 1);
          });
          setExpenses(filteredExpenses || []);
        }
      } catch (err) {
        console.error("Error fetching expenses for reports:", err);
        toast.error("Error fetching expenses for reports");
      }
    };

    fetchExpenses();
  }, []);

  const rangeFilteredExpenses = getRangeFilteredExpenses(
    expenses,
    selectedRange
  );

  const {
    data: monthlyData,
    maxShared,
    maxPersonal,
  } = getMonthlySharedPersonalData(rangeFilteredExpenses, selectedRange);

  const categoryData = getCategoryBreakdownData(rangeFilteredExpenses);
  const merchants = getTopMerchants(rangeFilteredExpenses);

  const totalShared = rangeFilteredExpenses
    .filter((exp) => exp.expenseType === "shared")
    .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  const totalPersonal = rangeFilteredExpenses
    .filter((exp) => exp.expenseType !== "shared")
    .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  let netPosition = 0;
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserName = user?.name || userName;

  rangeFilteredExpenses.forEach((exp) => {
    if (exp.expenseType === "shared" && exp.splits) {
      const paidBy = (
        exp.paidByName ||
        exp.paidBy?.name ||
        (typeof exp.paidBy === "string"
          ? exp.paidBy
          : exp.paidBy?.name) ||
        ""
      ).trim();

      if (!exp.splits || !Array.isArray(exp.splits)) return;

      exp.splits.forEach((split) => {
        const splitUserName = (
          split.userName || split.user?.name || ""
        ).trim();
        const amount = Number(split.amount) || 0;

        if (paidBy === currentUserName && splitUserName !== currentUserName) {
          netPosition += amount;
        } else if (
          paidBy !== currentUserName &&
          splitUserName === currentUserName
        ) {
          netPosition -= amount;
        }
      });
    }
  });

  // Get period label for display
  const getPeriodLabel = () => {
    if (selectedRange === "30d") return "Last 30 Days";
    if (selectedRange === "90d") return "Last 90 Days";
    if (selectedRange === "year") return "This Year";
    if (selectedRange === "all") return "All Time";
    return "Period";
  };

  // Get chart title based on period
  const getChartTitle = () => {
    if (selectedRange === "30d") return "Weekly Breakdown";
    if (selectedRange === "90d") return "Monthly Breakdown";
    if (selectedRange === "year") return "Monthly Breakdown";
    if (selectedRange === "all") return "Monthly Breakdown";
    return "Spending Breakdown";
  };

  const handleExportMerchants = () => {
    const csv = [
      ["Merchant", "Category", "Amount", "Transactions"],
      ...merchants.map((m) => [
        m.name,
        m.category,
        m.amount.toFixed(2),
        m.transactions,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `top_merchants_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("✅ Merchants exported successfully!");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
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

      <DashboardSidebar
        userName={userName}
        userEmail={userEmail}
        Index={0}
        avatar={avatar}
      />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8 mt-16 lg:mt-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Financial Reports
            </h1>
            <p className="text-sm sm:text-base text-white/50">
              Detailed breakdown based on your actual expenses •{" "}
              {getPeriodLabel()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all cursor-pointer"
            >
              <option value="30d" className="bg-[#1a1a1a] text-white">
                Last 30 Days
              </option>
              <option value="90d" className="bg-[#1a1a1a] text-white">
                Last 90 Days
              </option>
              <option value="year" className="bg-[#1a1a1a] text-white">
                This Year
              </option>
              <option value="all" className="bg-[#1a1a1a] text-white">
                All Time
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="xl:col-span-8 space-y-4 sm:space-y-6">
            {/* Stats Row - responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/5 border-l-4 border-l-green-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-white/60">
                    Shared Spending
                  </span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  ₹{Math.abs(totalShared).toFixed(2)}
                </p>
                <p className="text-[10px] sm:text-xs text-white/40 mt-1">
                  {
                    rangeFilteredExpenses.filter(
                      (e) => e.expenseType === "shared",
                    ).length
                  }{" "}
                  shared expenses in {getPeriodLabel().toLowerCase()}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/5 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">
                    Personal Spending
                  </span>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-white">
                  ₹{Math.abs(totalPersonal).toFixed(2)}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {
                    rangeFilteredExpenses.filter(
                      (e) => e.expenseType !== "shared",
                    ).length
                  }{" "}
                  personal expenses in {getPeriodLabel().toLowerCase()}
                </p>
              </div>

              <MonthlyComparisonCard expenses={expenses} />
            </div>

            {/* Shared vs Personal Spending Chart */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  {getChartTitle()} - Shared vs Personal
                </h3>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500" />
                    <span className="text-xs sm:text-sm text-white/60">
                      Shared
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                    <span className="text-xs sm:text-sm text-white/60">
                      Personal
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-48 sm:h-64">
                {monthlyData.length === 0 ||
                monthlyData.every((d) => d.shared === 0 && d.personal === 0) ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center">
                    <p className="text-xs sm:text-sm text-white/50 text-center px-4">
                      No expenses found for {getPeriodLabel().toLowerCase()}.
                      Add some expenses to see trends!
                    </p>
                  </div>
                ) : (
                  <div className="h-48 sm:h-64">
                    <div className="h-full flex items-end justify-around gap-2 sm:gap-4">
                      {monthlyData.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col gap-1 sm:gap-2 group"
                        >
                          <div className="flex gap-0.5 sm:gap-1 items-end h-40 sm:h-48">
                            {/* Shared Bar */}
                            <div
                              className="flex-1 bg-gradient-to-t from-orange-500 to-orange-600 rounded-t transition-all hover:from-orange-600 hover:to-orange-700 relative"
                              style={{
                                height: `${
                                  maxShared > 0
                                    ? Math.max(
                                        (item.shared / maxShared) * 100,
                                        item.shared > 0 ? 5 : 0,
                                      )
                                    : 0
                                }%`,
                                minHeight: item.shared > 0 ? "8px" : "0px",
                              }}
                            >
                              <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 bg-orange-500/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                ₹{item.shared.toFixed(0)}
                              </div>
                            </div>
                            {/* Personal Bar */}
                            <div
                              className="flex-1 bg-gradient-to-t from-red-500 to-red-600 rounded-t transition-all hover:from-red-600 hover:to-red-700 relative"
                              style={{
                                height: `${
                                  maxPersonal > 0
                                    ? Math.max(
                                        (item.personal / maxPersonal) * 100,
                                        item.personal > 0 ? 5 : 0,
                                      )
                                    : 0
                                }%`,
                                minHeight: item.personal > 0 ? "8px" : "0px",
                              }}
                            >
                              <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                ₹{item.personal.toFixed(0)}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] sm:text-xs text-white/40 text-center">
                            {item.month}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Spending by Category */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Spending by Category
                </h3>

                {categoryData.length === 0 ? (
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-sm text-white/50">
                      No categorized expenses found for{" "}
                      {getPeriodLabel().toLowerCase()}.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {categoryData.map((category, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/60">
                              {category.name}
                            </span>
                            <span className="text-sm text-white font-medium">
                              {category.value}% • ₹
                              {Math.abs(category.amount).toFixed(2)}
                            </span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${category.gradient} rounded-full transition-all`}
                              style={{ width: `${category.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-white/50 mt-6 text-center">
                      Highest spending category:{" "}
                      <span className="text-orange-500 font-semibold">
                        {categoryData[0].name} (₹
                        {Math.abs(categoryData[0].amount).toFixed(2)})
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Top Merchants */}
          <div className="xl:col-span-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/5 h-full">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Top Merchants
                </h3>
                <button className="text-xs sm:text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors">
                  View All
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {merchants.length === 0 ? (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-sm text-white/50">
                      No merchants found for {getPeriodLabel().toLowerCase()}.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {merchants.map((merchant, index) => {
                        const { icon: Icon, color } = getMerchantIconConfig(
                          merchant.category || merchant.name,
                        );

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <div className={`p-2.5 rounded-xl ${color}`}>
                              <Icon className="w-4 h-4" strokeWidth={1.5} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">
                                {merchant.name}
                              </p>
                              <p className="text-xs text-white/50 truncate">
                                {merchant.category}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold text-white">
                                ₹{Math.abs(merchant.amount).toFixed(2)}
                              </p>
                              <p className="text-xs text-white/40">
                                {merchant.transactions} transactions
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-3 mb-6">
                      {(() => {
                        const maxAmount = Math.max(
                          ...merchants.map((m) => m.amount || 0),
                          1,
                        );
                        const colors = [
                          "bg-green-500",
                          "bg-orange-500",
                          "bg-red-500",
                          "bg-blue-500",
                          "bg-purple-500",
                        ];

                        return merchants.slice(0, 3).map((merchant, index) => {
                          const percentage =
                            ((merchant.amount || 0) / maxAmount) * 100;
                          return (
                            <div key={index}>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    colors[index] || colors[colors.length - 1]
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                )}

                <button
                  onClick={handleExportMerchants}
                  className="w-full py-3 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 transition-colors font-medium"
                >
                  Export Merchants CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Reports;