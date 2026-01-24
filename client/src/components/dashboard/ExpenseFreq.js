import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

// Expense Frequency Card Component
export const ExpenseFrequencyCard = ({ transactions }) => {
  const calculateFrequency = () => {
    if (!transactions || transactions.length === 0) {
      return {
        avgPerWeek: 0,
        totalWeeks: 0,
        trend: 0,
        thisWeekCount: 0,
        lastWeekCount: 0,
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.rawDate) - new Date(b.rawDate),
    );
    const earliestDate =
      sortedTransactions.length > 0
        ? new Date(sortedTransactions[0].rawDate)
        : now;

    const timeDiff = now.getTime() - earliestDate.getTime();
    const totalWeeks = Math.max(
      Math.ceil(timeDiff / (7 * 24 * 60 * 60 * 1000)),
      1,
    );

    const thisWeekCount = transactions.filter(
      (t) => new Date(t.rawDate) >= oneWeekAgo,
    ).length;

    const lastWeekCount = transactions.filter((t) => {
      const date = new Date(t.rawDate);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    }).length;

    const avgPerWeek = transactions.length / totalWeeks;

    const trend =
      lastWeekCount > 0
        ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100
        : thisWeekCount > 0
          ? 100
          : 0;

    return {
      avgPerWeek: avgPerWeek.toFixed(1),
      totalWeeks,
      trend: trend.toFixed(1),
      thisWeekCount,
      lastWeekCount,
    };
  };

  const frequency = calculateFrequency();
  const isTrendingUp = parseFloat(frequency.trend) > 0;
  const isTrendingDown = parseFloat(frequency.trend) < 0;

  const getHabitStatus = () => {
    const avg = parseFloat(frequency.avgPerWeek);
    if (avg === 0) return { text: "No Data", color: "text-white/40" };
    if (avg < 3) return { text: "Light Spender", color: "text-green-500" };
    if (avg < 7) return { text: "Moderate", color: "text-yellow-500" };
    if (avg < 15) return { text: "Active", color: "text-orange-500" };
    return { text: "Frequent", color: "text-red-500" };
  };

  const habitStatus = getHabitStatus();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/5 hover:border-orange-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs sm:text-sm text-white/60 font-medium">
          Expense Frequency
        </span>
        <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10">
          <Calendar
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500"
            strokeWidth={1.5}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {frequency.avgPerWeek}
          </p>
          <span className="text-xs sm:text-sm text-white/50">per week</span>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center gap-1.5">
          {isTrendingUp && (
            <>
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
              <span className="text-[10px] sm:text-xs font-medium text-red-500">
                +{frequency.trend}%
              </span>
            </>
          )}
          {isTrendingDown && (
            <>
              <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
              <span className="text-[10px] sm:text-xs font-medium text-green-500">
                {frequency.trend}%
              </span>
            </>
          )}
          {!isTrendingUp && !isTrendingDown && (
            <span className="text-[10px] sm:text-xs font-medium text-white/40">
              No change
            </span>
          )}
          <span className="text-[10px] sm:text-xs text-white/40">
            vs last week
          </span>
        </div>

        {/* Spending Habit Badge */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-white/50">
              Spending Habit
            </span>
            <span
              className={`text-[10px] sm:text-xs font-semibold ${habitStatus.color}`}
            >
              {habitStatus.text}
            </span>
          </div>
        </div>

        {/* Weekly Comparison */}
        {transactions.length > 0 && (
          <div className="mt-2 p-2 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-white/50">This week</span>
              <span className="font-semibold text-white">
                {frequency.thisWeekCount} transactions
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs mt-1">
              <span className="text-white/50">Last week</span>
              <span className="font-semibold text-white/60">
                {frequency.lastWeekCount} transactions
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ExpensePatternChart = ({ transactions }) => {
  const getDailyBreakdown = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const breakdown = days.map(() => ({ count: 0, amount: 0 }));

    transactions.forEach((transaction) => {
      const dayIndex = new Date(transaction.rawDate).getDay();
      breakdown[dayIndex].count += 1;
      breakdown[dayIndex].amount += Math.abs(transaction.amount);
    });

    const maxCount = Math.max(...breakdown.map((d) => d.count), 1);

    return breakdown.map((data, index) => ({
      day: days[index],
      count: data.count,
      amount: data.amount,
      percentage: (data.count / maxCount) * 100,
    }));
  };

  const dailyData = getDailyBreakdown();
  const mostActiveDay = dailyData.reduce(
    (max, day) => (day.count > max.count ? day : max),
    dailyData[0],
  );

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/5 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-white">
          Spending Pattern
        </h3>
        <span className="text-[10px] sm:text-xs text-white/50">
          Most active:{" "}
          <span className="text-orange-500 font-semibold">
            {mostActiveDay.day}
          </span>
        </span>
      </div>

      <div className="h-28 sm:h-32 flex items-end justify-around gap-1">
        {dailyData.map((day, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center gap-2 group"
          >
            <div
              className="w-full bg-gradient-to-t from-orange-500/50 to-orange-600/50 rounded-t transition-all hover:from-orange-500 hover:to-orange-600 cursor-pointer relative"
              style={{
                height: `${day.percentage}%`,
                minHeight: day.count > 0 ? "10px" : "2px",
              }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-2 py-1 rounded text-[10px] sm:text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {day.count} (₹{day.amount > 0 ? day.amount.toFixed(0) : "0"})
              </div>
            </div>
            <span
              className={`text-[10px] sm:text-xs ${
                day.day === mostActiveDay.day
                  ? "text-orange-500 font-semibold"
                  : "text-white/40"
              }`}
            >
              {day.day}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] sm:text-xs text-white/40 mt-4 text-center">
        Shows your spending frequency by day of the week
      </p>
    </div>
  );
};
