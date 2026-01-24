import { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  Filter,
  X,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const Reports = ({ expenses, summaryData, yourBalance }) => {
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [personFilter, setPersonFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Calculate category breakdown from actual expenses
  const categoryData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return [{ name: "No Data", value: 1, color: "#6b7280" }];
    }

    const categoryTotals = {};

    expenses.forEach((expense) => {
      const cat = expense.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + expense.amount;
    });

    const colors = {
      Food: "#f97316",
      Transport: "#3b82f6",
      Shopping: "#ec4899",
      Entertainment: "#8b5cf6",
      Utilities: "#10b981",
      Health: "#ef4444",
      Travel: "#06b6d4",
      Other: "#6b7280",
    };

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: colors[name] || "#6b7280",
    }));
  }, [expenses]);

  // All Transactions - use actual expenses
  const allTransactions = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    return expenses.map((expense) => ({
      id: expense._id,
      date: new Date(expense.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidByName,
      splitWith: expense.splits?.map((s) => s.userName).join(", ") || "None",
      category: expense.category,
    }));
  }, [expenses]);

  const isDateInPeriod = (dateString, period) => {
    const transactionDate = new Date(dateString);
    const today = new Date();

    switch (period) {
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return transactionDate >= weekStart;
      case "month":
        return (
          transactionDate.getMonth() === today.getMonth() &&
          transactionDate.getFullYear() === today.getFullYear()
        );
      case "year":
        return transactionDate.getFullYear() === today.getFullYear();
      case "all":
      default:
        return true;
    }
  };

  const allPeople = useMemo(() => {
    const people = new Set(allTransactions.map((t) => t.paidBy));
    return ["all", ...Array.from(people)];
  }, [allTransactions]);

 const filteredTransactions = useMemo(() => {
   return allTransactions.filter((transaction) => {
     const matchesPeriod = isDateInPeriod(transaction.date, filterPeriod);

     const searchLower = searchTerm.toLowerCase().trim();
     const matchesSearch =
       searchLower === "" ||
       transaction.description.toLowerCase().includes(searchLower) ||
       transaction.paidBy.toLowerCase().includes(searchLower) ||
       transaction.splitWith.toLowerCase().includes(searchLower);

     const matchesCategory =
       categoryFilter === "all" || transaction.category === categoryFilter;

     const matchesPerson =
       personFilter === "all" ||
       transaction.paidBy === personFilter ||
       (transaction.splitWith === personFilter &&
         transaction.splitWith !== transaction.paidBy);

     return matchesPeriod && matchesSearch && matchesCategory && matchesPerson;
   });
 }, [searchTerm, categoryFilter, personFilter, filterPeriod, allTransactions]);


  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim() !== "") count++;
    if (categoryFilter !== "all") count++;
    if (personFilter !== "all") count++;
    return count;
  }, [searchTerm, categoryFilter, personFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setPersonFilter("all");
    setFilterPeriod("all");
  };

  const filteredCategoryData = useMemo(
    () => categoryData.filter((c) => c.name !== "Settlement"),
    [categoryData]
  );


  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl hover:bg-white/10 hover:border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/60">
              Total Expenses
            </span>
            <Wallet className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-white">
            ₹{summaryData?.totalExpenses?.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs mt-2 text-white/40">All time</p>
        </div>

        {/* You Paid */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl hover:bg-white/10 hover:border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/60">You Paid</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">
            ₹{summaryData?.youPaid?.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs mt-2 text-white/40">Total paid by you</p>
        </div>

        {/* You Owe */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl hover:bg-white/10 hover:border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/60">You Owe</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-500">
            ₹{yourBalance < 0 ? (-1 * yourBalance).toFixed(2) : "0.00"}
          </p>
          <p className="text-xs mt-2 text-white/40">Amount to pay</p>
        </div>

        {/* Others Owe You */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl hover:bg-white/10 hover:border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/60">
              Owed to You
            </span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500">
            ₹{yourBalance > 0 ? yourBalance.toFixed(2) : "0.00"}
          </p>
          <p className="text-xs mt-2 text-white/40">Amount to receive</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={filteredCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {filteredCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 30, 30, 0.95)",
                  border: "1px solid rgba(249, 115, 22, 0.3)",
                  borderRadius: "8px",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(249, 115, 22, 0.2)",
                }}
                labelStyle={{ color: "rgba(255, 255, 255, 0.7)" }}
                itemStyle={{ color: "#f97316" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {filteredCategoryData
              .filter((category) => category !== "Settlement")
              .map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-white/70">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    ₹{category.value.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Category Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredCategoryData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 30, 30, 0.95)",
                  border: "1px solid rgba(249, 115, 22, 0.3)",
                  borderRadius: "8px",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(249, 115, 22, 0.2)",
                }}
                cursor={{ fill: "rgba(249, 115, 22, 0.15)" }}
                labelStyle={{ color: "rgba(255, 255, 255, 0.7)" }}
                itemStyle={{ color: "#f97316" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {filteredCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-white">
            Transaction History
            <span className="ml-2 text-sm font-normal text-white/50">
              ({filteredTransactions.length}{" "}
              {filteredTransactions.length !== allTransactions.length &&
                `of ${allTransactions.length}`}
              )
            </span>
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 w-48"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                showFilters
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white text-orange-500 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Period Dropdown */}
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="week" className="bg-[#0a0a0a]">
                This Week
              </option>
              <option value="month" className="bg-[#0a0a0a]">
                This Month
              </option>
              <option value="year" className="bg-[#0a0a0a]">
                This Year
              </option>
              <option value="all" className="bg-[#0a0a0a]">
                All Time
              </option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-4 rounded-lg border border-white/10 bg-white/5 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Advanced Filters</h4>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1 font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white/60">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="all" className="bg-[#0a0a0a]">
                    All Categories
                  </option>
                  <option value="Food" className="bg-[#0a0a0a]">
                    Food
                  </option>
                  <option value="Transport" className="bg-[#0a0a0a]">
                    Transport
                  </option>
                  <option value="Shopping" className="bg-[#0a0a0a]">
                    Shopping
                  </option>
                  <option value="Entertainment" className="bg-[#0a0a0a]">
                    Entertainment
                  </option>
                  <option value="Utilities" className="bg-[#0a0a0a]">
                    Utilities
                  </option>
                  <option value="Health" className="bg-[#0a0a0a]">
                    Health
                  </option>
                  <option value="Travel" className="bg-[#0a0a0a]">
                    Travel
                  </option>
                  <option value="Other" className="bg-[#0a0a0a]">
                    Other
                  </option>
                </select>
              </div>

              {/* Person Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white/60">
                  Paid By
                </label>
                <select
                  value={personFilter}
                  onChange={(e) => setPersonFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {allPeople.map((person) => (
                    <option
                      key={person}
                      value={person}
                      className="bg-[#0a0a0a]"
                    >
                      {person === "all" ? "All People" : person}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 flex items-center gap-1">
                    Search: "{searchTerm}"
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSearchTerm("")}
                    />
                  </span>
                )}
                {categoryFilter !== "all" && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 flex items-center gap-1">
                    Category: {categoryFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setCategoryFilter("all")}
                    />
                  </span>
                )}
                {personFilter !== "all" && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 flex items-center gap-1">
                    Paid by: {personFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setPersonFilter("all")}
                    />
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-lg font-medium mb-2 text-white/70">
                No transactions found
              </p>
              <p className="text-sm mb-4 text-white/40">
                {allTransactions.length === 0
                  ? "Add some expenses to see them here"
                  : "Try adjusting your filters"}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-white/60">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-white/60">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-white/60">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-white/60">
                    Paid By
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-white/60">
                    Split With
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-white/60">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-sm text-white/50">
                      {transaction.date}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-white">
                      {transaction.description}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.category === "Food"
                            ? "bg-orange-500/20 text-orange-400"
                            : transaction.category === "Transport"
                            ? "bg-blue-500/20 text-blue-400"
                            : transaction.category === "Shopping"
                            ? "bg-pink-500/20 text-pink-400"
                            : transaction.category === "Entertainment"
                            ? "bg-purple-500/20 text-purple-400"
                            : transaction.category === "Utilities"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : transaction.category === "Health"
                            ? "bg-red-500/20 text-red-400"
                            : transaction.category === "Travel"
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {transaction.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/70">
                      {transaction.paidBy}
                    </td>
                    <td className="py-3 px-4 text-sm text-white/50">
                      {transaction.splitWith}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-right text-orange-500">
                      ₹{transaction.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;