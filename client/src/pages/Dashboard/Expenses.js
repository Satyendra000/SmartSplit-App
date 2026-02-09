import { useState, useEffect } from "react";
import API_URL from "../../config/api";
import {
  Users,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Building,
  Banknote,
  X,
} from "lucide-react";
import DashboardSidebar from "../../components/dashboard/Sidebar";
import { ExpenseFrequencyCard, ExpensePatternChart } from "../../components/dashboard/ExpenseFreq";

const categories = [
  { name: "Groceries", icon: "🛒", color: "bg-orange-500/20 text-orange-400" },
  { name: "Transport", icon: "🚗", color: "bg-orange-500/20 text-orange-400" },
  {
    name: "Entertainment",
    icon: "📺",
    color: "bg-orange-500/20 text-orange-400",
  },
  { name: "Food", icon: "🍕", color: "bg-orange-500/20 text-orange-400" },
  { name: "Shopping", icon: "🛍️", color: "bg-pink-500/20 text-pink-400" },
  { name: "Utilities", icon: "⚡", color: "bg-blue-500/20 text-blue-400" },
  { name: "Bills", icon: "📄", color: "bg-yellow-500/20 text-yellow-400" },
  { name: "Health", icon: "🏥", color: "bg-red-500/20 text-red-400" },
  { name: "Travel", icon: "✈️", color: "bg-cyan-500/20 text-cyan-400" },
];

const Expenses = ({toast}) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const avatar = JSON.parse(localStorage.getItem("user")).avatar;

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Food",
    expenseType: "shared",
  });

  const userName = localStorage.getItem("userName") || "Alex";
  const userEmail = localStorage.getItem("userEmail") || "alex@example.com";
  const itemsPerPage = 10;

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        window.location.href = "/auth";
        return;
      }

      const response = await fetch(`${API_URL}/api/expenses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const currentUserName = localStorage.getItem("userName") || "User";
        const filteredExpenses = data.data.filter((expense) => {
          // Keep all expenses except group creation placeholders
          return !(
            expense.amount === 0.01 &&
            expense.expenseType === "shared" &&
            expense.splits?.length === 1
          );
        });

        const processedTransactions = filteredExpenses.map((expense) => ({
          id: expense._id,
          date: new Date(expense.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          name: expense.description,
          description:
            expense.expenseType === "shared" ? "Split Bill" : "Personal",
          category: expense.category || "Other",
          payment: {
            type: expense.expenseType === "shared" ? "Split" : "Personal",
            last4: "",
          },
          status: "Completed",
          amount:
            expense.paidByName === currentUserName
              ? expense.amount
              : -expense.amount,
          rawDate: new Date(expense.date),
          groupName: expense.groupName || "",
        }));

        processedTransactions.sort((a, b) => b.rawDate - a.rawDate);
        setTransactions(processedTransactions);
        setFilteredTransactions(processedTransactions);
      } else {
        console.error("Failed to fetch expenses:", data.message);
        toast.error("Failed to fetch expenses");
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error(
        "Error loading expenses. Please ensure backend is running",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, filterCategory, filterPayment, filterStatus]);

  const applyFilters = () => {
    let filtered = [...transactions];

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.amount.toString().includes(searchQuery)
      );
    }

    if (filterCategory !== "All") {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    if (filterPayment !== "All") {
      filtered = filtered.filter((t) => t.payment.type === filterPayment);
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleAddExpense = async () => {
    if (!newExpense.description.trim()) {
      toast.warning("⚠️ Please enter a description");
      return;
    }

    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      toast.warning("⚠️ Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user")); // Get full user object

      if (!token || !user) {
        toast.error("Please login first");
        window.location.href = "/auth";
        return;
      }

      // Extract user ID - backend uses _id
      const userId = user.id || user._id;
      const currentUserName = user.name || localStorage.getItem("userName");

      const expenseData = {
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        expenseType: newExpense.expenseType,
        paidByName: currentUserName,
        splits: [
          {
            user: userId,
            userName: currentUserName,
            amount: parseFloat(newExpense.amount),
            paid: true,
          },
        ],
      };


      const response = await fetch(`${API_URL}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        setNewExpense({
          description: "",
          amount: "",
          category: "Food",
          expenseType: "shared",
        });
        await fetchExpenses();
        toast.success("✅ Expense added successfully!");
      } else {
        toast.error(`Failed to add expense: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      [
        "Date",
        "Description",
        "Category",
        "Payment",
        "Status",
        "Amount",
        "Group",
      ],
      ...filteredTransactions.map((t) => [
        t.date,
        t.name,
        t.category,
        t.payment.type,
        t.status,
        t.amount.toFixed(2),
        t.groupName || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("✅ Export completed! Check your downloads.");
  };

  const getCategoryStyle = (categoryName) => {
    const category = categories.find((c) => c.name === categoryName);
    return (
      category || {
        name: categoryName,
        icon: "📋",
        color: "bg-white/10 text-white/60",
      }
    );
  };

  const getPaymentIcon = (type) => {
    if (type === "Checking" || type === "Personal") return Building;
    if (type === "Cash") return Banknote;
    return CreditCard;
  };

  const totalFiltered = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        Index={3}
        avatar={avatar}
      />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8 mt-16 lg:mt-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Transaction History
            </h1>
            <p className="text-sm sm:text-base text-white/50">
              Manage, filter, and track all your expenses and income.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-lg transition-all text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              <span className="sm:inline">Export CSV</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              New Expense
            </button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Total Filtered */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-sm rounded-xl p-5 border border-orange-500/20 hover:border-orange-500/40 transition-all shadow-lg shadow-orange-500/5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-orange-300 font-medium">
                Total Expenses
              </span>
              <div className="p-2 rounded-lg bg-orange-500/20 ring-1 ring-orange-500/30">
                <CreditCard
                  className="w-4 h-4 text-orange-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tight text-white">
                ₹{Math.abs(totalFiltered).toFixed(2)}
              </p>
              <p className="text-xs text-orange-300/70">
                {filteredTransactions.length} transactions
              </p>
            </div>
          </div>

          {/* Average Transaction */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all shadow-lg shadow-blue-500/5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-blue-300 font-medium">
                Average Amount
              </span>
              <div className="p-2 rounded-lg bg-blue-500/20 ring-1 ring-blue-500/30">
                <CreditCard
                  className="w-4 h-4 text-blue-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tight text-white">
                ₹
                {filteredTransactions.length > 0
                  ? (
                      Math.abs(totalFiltered) / filteredTransactions.length
                    ).toFixed(2)
                  : "0.00"}
              </p>
              <p className="text-xs text-blue-300/70">per transaction</p>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm rounded-xl p-5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-lg shadow-emerald-500/5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-emerald-300 font-medium">
                This Month
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/20 ring-1 ring-emerald-500/30">
                <CreditCard
                  className="w-4 h-4 text-emerald-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tight text-white">
                ₹
                {transactions
                  .filter((t) => {
                    const date = new Date(t.rawDate);
                    const now = new Date();
                    return (
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear()
                    );
                  })
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toFixed(2)}
              </p>
              <p className="text-xs text-emerald-300/70">
                current month spending
              </p>
            </div>
          </div>

          {/* Expense Frequency - THE NEW CARD */}
          <ExpenseFrequencyCard transactions={filteredTransactions} />
        </div>
        {/* Optional: Expense Pattern Chart */}
        {filteredTransactions.length > 0 && (
          <ExpensePatternChart transactions={filteredTransactions} />
        )}
        {/* Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 mt-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/50 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-white/50 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-white/60">Loading expenses...</p>
                    </td>
                  </tr>
                ) : paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => {
                    const category = getCategoryStyle(transaction.category);
                    const PaymentIcon = getPaymentIcon(
                      transaction.payment.type,
                    );

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-white/60">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">
                                {transaction.name}
                              </p>
                              {/* ✅ GROUP TAG */}
                              {transaction.groupName && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                                  <Users className="w-3 h-3" />
                                  {transaction.groupName}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-white/50">
                              {transaction.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${category.color}`}
                          >
                            <span>{category.icon}</span>
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <PaymentIcon className="w-4 h-4" />
                            <span>{transaction.payment.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              transaction.status === "Completed"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-semibold ${
                            transaction.amount > 0
                              ? "text-green-500"
                              : "text-white"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}₹
                          {Math.abs(transaction.amount).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-white/50"
                    >
                      No expenses found. Add your first expense!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t border-white/5 gap-4">
              <p className="text-xs sm:text-sm text-white/50 text-center sm:text-left">
                Showing{" "}
                <span className="font-medium text-white">
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredTransactions.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-white">
                  {filteredTransactions.length}
                </span>{" "}
                transactions
              </p>

              <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 sm:px-4 py-1.5 border border-gray-300">
                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                  Total
                </span>
                <span className="text-sm sm:text-md font-bold text-green-700">
                  ₹{Math.abs(totalFiltered).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Show fewer page numbers on mobile */}
                {[
                  ...Array(
                    Math.min(totalPages, window.innerWidth < 640 ? 2 : 3),
                  ),
                ].map((_, idx) => {
                  const page = idx + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all text-xs sm:text-sm ${
                        currentPage === page
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium"
                          : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {totalPages > (window.innerWidth < 640 ? 2 : 3) && (
                  <span className="px-2 text-white/50 text-xs sm:text-sm">
                    ...
                  </span>
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Add New Expense
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                    placeholder="e.g., Lunch with friends"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Category
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                  >
                    {categories.map((cat) => (
                      <option
                        key={cat.name}
                        value={cat.name}
                        className="bg-[#1a1a1a] text-white"
                      >
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Type
                  </label>
                  <select
                    value={newExpense.expenseType}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        expenseType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                  >
                    <option value="shared" className="bg-[#1a1a1a] text-white">
                      Shared
                    </option>
                    <option
                      value="personal"
                      className="bg-[#1a1a1a] text-white"
                    >
                      Personal
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 order-1 sm:order-2"
              >
                {loading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;