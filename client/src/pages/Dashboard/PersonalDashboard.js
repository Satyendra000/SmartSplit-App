import { useState, useEffect } from "react";
import { Wallet, CreditCard, Users, Plus } from "lucide-react";
import DashboardSidebar from "../../components/dashboard/Sidebar";
import { expenseAPI } from "../../services/api";
import { BudgetStatusCard, BudgetSettingsModal } from "../../components/dashboard/BudgetStatus";

const PersonalDashboard = ({toast}) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState("5weeks");
  const [stats, setStats] = useState({
    transactionCount: 0,
    monthlySpending: 0,
    netPosition: 0,
    spendingTrend: 0,
  });

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const userName = localStorage.getItem("userName") || "Alex";
  const userEmail = localStorage.getItem("userEmail") || "alex@example.com";
  const avatar = JSON.parse(localStorage.getItem("user")).avatar;
  const [currentBudget, setCurrentBudget] = useState(0);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseAPI.getAll();
      if (response.data.success) {
        const filteredExpenses = response.data.data.filter((expense) => {
          return !(
            expense.amount === 0.01 &&
            expense.expenseType === "shared" &&
            expense.splits?.length === 1
          );
        });
        const expenseData = filteredExpenses;
        setExpenses(expenseData);
        calculateStats(expenseData);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      toast.error("Error fetching expenses");
    } finally {
      setLoading(false);
    }
  };

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
        setCurrentBudget(data.data.monthlyBudget || 0);
      }
    } catch (error) {
      console.error("Error fetching budget:", error);
      toast.error("Error fetching budget");
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBudget();
  }, []);

  const handleBudgetSave = (newBudget) => {
    setCurrentBudget(newBudget);
    setRefreshKey((prev) => prev + 1);
  };

  const calculateStats = (expenseData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthExpenses = expenseData.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    });

    const lastMonthExpenses = expenseData.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === lastMonth &&
        expDate.getFullYear() === lastMonthYear
      );
    });

    const currentMonthTotal = currentMonthExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    );
    const lastMonthTotal = lastMonthExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    );

    const trend =
      lastMonthTotal > 0
        ? (
            ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) *
            100
          ).toFixed(1)
        : 0;

    let netPosition = 0;
    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.name;

    expenseData.forEach((exp) => {
      if (exp.expenseType === "shared" && exp.splits) {
        const paidBy = exp.paidByName;
        exp.splits.forEach((split) => {
          if (paidBy === userName && split.userName !== userName) {
            netPosition += split.amount;
          } else if (paidBy !== userName && split.userName === userName) {
            netPosition -= split.amount;
          }
        });
      }
    });

    setStats({
      transactionCount: currentMonthExpenses.length,
      monthlySpending: currentMonthTotal,
      netPosition: netPosition,
      spendingTrend: parseFloat(trend),
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
  });

  const getCategoryBreakdown = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const categories = {};

    const currentMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    });

    currentMonthExpenses.forEach((exp) => {
      const cat = exp.category || "Other";
      categories[cat] = (categories[cat] || 0) + exp.amount;
    });

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    const categoryData = Object.entries(categories).map(([name, value]) => ({
      name,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      amount: value,
      color: getCategoryColor(name),
    }));

    return categoryData.sort((a, b) => b.value - a.value).slice(0, 5);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Food: "#f97316",
      Groceries: "#10b981",
      Transport: "#3b82f6",
      Shopping: "#ec4899",
      Entertainment: "#8b5cf6",
      Utilities: "#10b981",
      Bills: "#eab308",
      Health: "#ef4444",
      Travel: "#06b6d4",
      Rent: "#f97316",
      Other: "#6b7280",
    };
    return colors[category] || "#6b7280";
  };

  const getSpendingData = () => {
    const now = new Date();
    let data = [];
    let maxAmount = 1;

    if (trendPeriod === "5weeks") {
      const weeks = Array(5)
        .fill(null)
        .map(() => []);

      expenses.forEach((exp) => {
        const expDate = new Date(exp.date);
        const diffTime = now - expDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);

        if (weekIndex < 5) {
          weeks[4 - weekIndex].push(exp.amount);
        }
      });

      data = weeks.map((week, idx) => ({
        label: `W${5 - idx}`,
        amount: week.reduce((sum, val) => sum + val, 0),
      }));
    } else if (trendPeriod === "thismonth") {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const weeks = Array(4)
        .fill(null)
        .map(() => []);

      expenses.forEach((exp) => {
        const expDate = new Date(exp.date);
        if (
          expDate.getMonth() === currentMonth &&
          expDate.getFullYear() === currentYear
        ) {
          const day = expDate.getDate();
          const weekIndex = Math.min(3, Math.floor((day - 1) / 7));
          weeks[weekIndex].push(exp.amount);
        }
      });

      data = weeks.map((week, idx) => ({
        label: `Week ${idx + 1}`,
        amount: week.reduce((sum, val) => sum + val, 0),
      }));
    } else if (trendPeriod === "3months") {
      const months = Array(3)
        .fill(null)
        .map(() => []);

      expenses.forEach((exp) => {
        const expDate = new Date(exp.date);
        const monthDiff =
          (now.getFullYear() - expDate.getFullYear()) * 12 +
          (now.getMonth() - expDate.getMonth());

        if (monthDiff >= 0 && monthDiff < 3) {
          months[2 - monthDiff].push(exp.amount);
        }
      });

      const monthNames = [];
      for (let i = 2; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthNames.push(date.toLocaleDateString("en-US", { month: "short" }));
      }

      data = months.map((month, idx) => ({
        label: monthNames[idx],
        amount: month.reduce((sum, val) => sum + val, 0),
      }));
    }

    maxAmount = Math.max(...data.map((d) => d.amount), 1);
    return { data, maxAmount };
  };

  const getRecentActivities = () => {
    return expenses.slice(0, 6).map((exp) => ({
      id: exp._id,
      title: exp.description,
      subtitle: exp.category || "Expense",
      amount: -exp.amount,
      time: formatTime(exp.date),
      icon: getCategoryIcon(exp.category),
      groupName: exp.groupName || "",
    }));
  };

  const getCategoryIcon = (category) => {
    return category || "Receipt";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const categoryData = getCategoryBreakdown();
  const { data: spendingData, maxAmount: maxSpending } = getSpendingData();
  const recentActivities = getRecentActivities();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
        Index={1}
        avatar={avatar}
      />

      {/* Main Content */}
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8 mt-16 lg:mt-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {getGreeting()}, {userName.split(" ")[0]}
            </h1>
            <p className="text-sm sm:text-base text-white/50">
              Here's your financial breakdown for {currentMonth}.
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/dashboard/expenses")}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Quick Add Expense
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Stats Cards */}
          <div className="xl:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Monthly Spending */}
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-lg shadow-purple-500/5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs sm:text-sm text-purple-300 font-medium">
                    Monthly Spending
                  </span>
                  <div className="p-2 rounded-lg bg-purple-500/20 ring-1 ring-purple-500/30">
                    <CreditCard
                      className="w-4 h-4 text-purple-400"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    ₹{stats.monthlySpending.toFixed(2)}
                  </p>
                  <p className="text-xs text-purple-300/70">
                    Total expenses this month
                  </p>
                </div>
              </div>

              <BudgetStatusCard
                key={refreshKey}
                stats={stats}
                onSetBudget={() => setShowBudgetModal(true)}
                refreshTrigger={refreshKey}
              />

              {/* Transactions This Month */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-lg shadow-cyan-500/5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs sm:text-sm text-cyan-300 font-medium">
                    Transactions
                  </span>
                  <div className="p-2 rounded-lg bg-cyan-500/20 ring-1 ring-cyan-500/30">
                    <Wallet
                      className="w-4 h-4 text-cyan-400"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {stats.transactionCount}
                  </p>
                  <p className="text-xs text-cyan-300/70">
                    Expenses recorded this month
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Spending Chart */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Spending Trends
                  </h3>
                  <select
                    value={trendPeriod}
                    onChange={(e) => setTrendPeriod(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white/90 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all cursor-pointer w-full sm:w-auto"
                  >
                    <option value="5weeks" className="bg-[#1a1a1a] text-white">
                      Last 5 Weeks
                    </option>
                    <option
                      value="thismonth"
                      className="bg-[#1a1a1a] text-white"
                    >
                      This Month
                    </option>
                    <option value="3months" className="bg-[#1a1a1a] text-white">
                      Last 3 Months
                    </option>
                  </select>
                </div>

                <div className="h-40 sm:h-48 flex items-end justify-around gap-1 sm:gap-2">
                  {spendingData.length > 0 ? (
                    spendingData.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-2 group"
                      >
                        <div
                          className="w-full bg-gradient-to-t from-orange-500 to-orange-600 rounded-t-lg transition-all hover:from-orange-600 hover:to-orange-700 cursor-pointer relative"
                          style={{
                            height: `${Math.max((item.amount / maxSpending) * 100, 5)}%`,
                            minHeight: item.amount > 0 ? "20px" : "8px",
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ₹{item.amount.toFixed(0)}
                          </div>
                        </div>
                        <span className="text-[10px] sm:text-xs text-white/40">
                          {item.label}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <p className="text-white/40 text-xs sm:text-sm">
                        No data available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/5">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Category Breakdown
                  </h3>
                  <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">
                    This Month
                  </span>
                </div>

                {categoryData.length > 0 ? (
                  <>
                    <div className="relative h-40 sm:h-48 flex items-center justify-center mb-4">
                      {/* Responsive SVG - scales based on container */}
                      <svg
                        viewBox="0 0 160 160"
                        className="w-full h-full max-w-[160px] max-h-[160px] transform -rotate-90"
                      >
                        {/* Background circle */}
                        <circle
                          cx="80"
                          cy="80"
                          r={60}
                          fill="none"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="20"
                        />

                        {/* Category segments */}
                        {categoryData.map((item, index) => {
                          const circumference = 2 * Math.PI * 60;
                          const offset = categoryData
                            .slice(0, index)
                            .reduce(
                              (sum, cat) =>
                                sum + (cat.value / 100) * circumference,
                              0,
                            );
                          const segmentLength =
                            (item.value / 100) * circumference;

                          return (
                            <circle
                              key={index}
                              cx="80"
                              cy="80"
                              r={60}
                              fill="none"
                              stroke={item.color}
                              strokeWidth="20"
                              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                              strokeDashoffset={-offset}
                              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                              style={{
                                filter: "drop-shadow(0 0 2px rgba(0,0,0,0.3))",
                              }}
                            />
                          );
                        })}
                      </svg>

                      {/* Center text - positioned absolutely */}
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                          ₹{(stats.monthlySpending / 1000).toFixed(1)}k
                        </span>
                        <span className="text-[10px] sm:text-xs text-white/50">
                          Total Spent
                        </span>
                      </div>
                    </div>

                    {/* Category list - better mobile layout */}
                    <div className="space-y-2">
                      {categoryData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-transform group-hover:scale-110 flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs sm:text-sm text-white/70 group-hover:text-white transition-colors truncate">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                            <span className="text-[10px] sm:text-xs text-white/40 min-w-[30px] text-right">
                              {item.value}%
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-white min-w-[60px] sm:min-w-[80px] text-right">
                              ₹{item.amount.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer info */}
                    {categoryData.length > 0 && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5">
                        <p className="text-[10px] sm:text-xs text-white/50 text-center">
                          Top category:{" "}
                          <span className="text-orange-400 font-semibold">
                            {categoryData[0].name}
                          </span>
                          {categoryData.length <
                            Object.keys(
                              expenses.reduce((acc, exp) => {
                                const cat = exp.category || "Other";
                                acc[cat] = true;
                                return acc;
                              }, {}),
                            ).length && (
                            <span className="ml-1">
                              • +
                              {Object.keys(
                                expenses.reduce((acc, exp) => {
                                  const cat = exp.category || "Other";
                                  acc[cat] = true;
                                  return acc;
                                }, {}),
                              ).length - categoryData.length}{" "}
                              more
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-40 sm:h-48 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                      <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white/20" />
                    </div>
                    <p className="text-white/40 text-xs sm:text-sm">
                      No expenses this month
                    </p>
                    <p className="text-white/30 text-[10px] sm:text-xs mt-1">
                      Add an expense to see breakdown
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="xl:col-span-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/5 h-full">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Recent Activity
                </h3>
                <button
                  onClick={() => (window.location.href = "/dashboard/expenses")}
                  className="text-xs sm:text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors"
                >
                  View All
                </button>
              </div>

              {recentActivities.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="p-2 sm:p-2.5 rounded-xl bg-orange-500/10 flex-shrink-0">
                        <CreditCard
                          className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500"
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                          <p className="font-medium text-white text-xs sm:text-sm truncate">
                            {activity.title}
                          </p>
                          {activity.groupName && (
                            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[9px] sm:text-[10px] font-medium border border-blue-500/30 flex-shrink-0">
                              <Users className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                              {activity.groupName}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-white/50">
                          {activity.subtitle}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-white text-xs sm:text-sm">
                          {activity.amount > 0 ? "+" : ""}₹
                          {Math.abs(activity.amount).toFixed(2)}
                        </p>
                        <p className="text-[9px] sm:text-xs text-white/40 whitespace-nowrap">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-white/20 mb-3" />
                  <p className="text-white/50 text-xs sm:text-sm">
                    No recent activity
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <BudgetSettingsModal
        show={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        currentBudget={currentBudget}
        onSave={handleBudgetSave}
        toast={toast}
      />
    </div>
  );
};

export default PersonalDashboard;
