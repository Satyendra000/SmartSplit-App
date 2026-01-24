const SpendingChart = () => {
  const data = [
    { week: "Week 1", amount: 1200 },
    { week: "Week 2", amount: 980 },
    { week: "Week 3", amount: 1450 },
    { week: "Week 4", amount: 1100 },
    { week: "Week 5", amount: 1680 },
  ];

  const maxAmount = Math.max(...data.map((d) => d.amount));

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Spending Trends</h3>
        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/60 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
        </select>
      </div>

      <div className="h-48 flex items-end justify-around gap-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center gap-2 group"
          >
            <div
              className="w-full bg-gradient-to-t from-orange-500 to-orange-600 rounded-t-lg transition-all hover:from-orange-600 hover:to-orange-700 cursor-pointer relative"
              style={{ height: `${(item.amount / maxAmount) * 100}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ₹{item.amount}
              </div>
            </div>
            <span className="text-xs text-white/40">{item.week}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpendingChart;
