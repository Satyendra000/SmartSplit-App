import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

// Monthly Comparison Card Component for Reports Page
export const MonthlyComparisonCard = ({ expenses }) => {
  const calculateMonthlyData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthExpenses = expenses.filter((e) => {
      const date = new Date(e.date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });

    const lastMonthExpenses = expenses.filter((e) => {
      const date = new Date(e.date);
      return (
        date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
      );
    });

    const currentMonthTotal = currentMonthExpenses.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0,
    );
    const lastMonthTotal = lastMonthExpenses.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0,
    );

    const difference = currentMonthTotal - lastMonthTotal;
    const percentChange =
      lastMonthTotal > 0
        ? ((difference / lastMonthTotal) * 100).toFixed(1)
        : currentMonthTotal > 0
          ? 100
          : 0;

    const currentMonthName = now.toLocaleDateString("en-US", {
      month: "short",
    });
    const lastMonthDate = new Date(lastMonthYear, lastMonth, 1);
    const lastMonthName = lastMonthDate.toLocaleDateString("en-US", {
      month: "short",
    });

    return {
      current: currentMonthTotal,
      last: lastMonthTotal,
      difference: Math.abs(difference),
      percentChange: parseFloat(percentChange),
      isIncrease: difference > 0,
      currentMonthName,
      lastMonthName,
      currentCount: currentMonthExpenses.length,
      lastCount: lastMonthExpenses.length,
    };
  };

  const data = calculateMonthlyData();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/5 border-l-4 border-l-orange-500">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm text-white/60">
          Month-over-Month
        </span>
        <div
          className={`flex items-center gap-1 ${
            data.isIncrease ? "text-red-500" : "text-green-500"
          }`}
        >
          {data.isIncrease ? (
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
          <span className="text-[10px] sm:text-xs font-semibold">
            {data.isIncrease ? "+" : ""}
            {data.percentChange}%
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <p
          className={`text-xl sm:text-2xl font-bold ${
            data.isIncrease ? "text-red-500" : "text-green-500"
          }`}
        >
          {data.isIncrease ? "+" : "-"}₹{data.difference.toFixed(2)}
        </p>
      </div>

      <div className="text-[10px] sm:text-xs text-white/40 space-y-1">
        <div className="flex items-center justify-between">
          <span>{data.currentMonthName} (This month)</span>
          <span className="font-semibold text-white">
            ₹{data.current.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>{data.lastMonthName} (Last month)</span>
          <span className="font-semibold text-white/60">
            ₹{data.last.toFixed(2)}
          </span>
        </div>
        <div className="pt-2 border-t border-white/10 mt-2">
          <p>
            {data.isIncrease
              ? `Spending increased by ₹${data.difference.toFixed(2)} this month.`
              : data.difference > 0
                ? `Great! You saved ₹${data.difference.toFixed(2)} this month.`
                : "No change in spending this month."}
          </p>
        </div>
      </div>
    </div>
  );
};

// Alternative: Spending Insights Card
export const SpendingInsightsCard = ({ expenses }) => {
  const calculateInsights = () => {
    if (!expenses || expenses.length === 0) {
      return {
        avgPerDay: 0,
        topCategory: "N/A",
        topCategoryAmount: 0,
        topCategoryPercent: 0,
      };
    }

    const now = new Date();
    const firstExpense = new Date(
      Math.min(...expenses.map((e) => new Date(e.date))),
    );
    const daysDiff = Math.max(
      Math.ceil((now - firstExpense) / (1000 * 60 * 60 * 24)),
      1,
    );
    const totalAmount = expenses.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0,
    );
    const avgPerDay = totalAmount / daysDiff;

    const categoryTotals = {};
    expenses.forEach((exp) => {
      const cat = exp.category || "Other";
      categoryTotals[cat] =
        (categoryTotals[cat] || 0) + (Number(exp.amount) || 0);
    });

    const topCategory = Object.entries(categoryTotals).reduce(
      (max, [cat, amount]) => (amount > max.amount ? { cat, amount } : max),
      { cat: "N/A", amount: 0 },
    );

    return {
      avgPerDay: avgPerDay.toFixed(2),
      topCategory: topCategory.cat,
      topCategoryAmount: topCategory.amount.toFixed(2),
      topCategoryPercent:
        totalAmount > 0
          ? ((topCategory.amount / totalAmount) * 100).toFixed(0)
          : 0,
    };
  };

  const insights = calculateInsights();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/5 border-l-4 border-l-orange-500">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm text-white/60">Daily Average</span>
        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
      </div>

      <p className="text-xl sm:text-2xl font-bold text-white mb-2">
        ₹{insights.avgPerDay}
      </p>

      <div className="text-[10px] sm:text-xs text-white/40 space-y-1">
        <p className="mb-2">per day spending rate</p>
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span>Top Category</span>
            <span className="text-orange-500 font-semibold">
              {insights.topCategoryPercent}%
            </span>
          </div>
          <p className="text-white font-medium text-xs sm:text-sm">
            {insights.topCategory}
          </p>
          <p className="text-white/50 mt-1">
            ₹{insights.topCategoryAmount} spent
          </p>
        </div>
      </div>
    </div>
  );
};
