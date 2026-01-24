import { useState, useEffect } from "react";
import API_URL from "../../config/api";
import {
  Plus,
  MoreHorizontal,
  Home,
  Car,
  Utensils,
  Zap,
  Gift,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Users,
  CheckCircle,
  X,
  Trash2,
  UserPlus,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useConfirm } from "../../components/common/ConfirmModal";
import DashboardSidebar from "../../components/dashboard/Sidebar";
import { expenseAPI, groupAPI } from "../../services/api";

const Groups = ({ toast }) => {
  const { confirm, ConfirmModal } = useConfirm();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupDetailModal, setShowGroupDetailModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [markingAsPaid, setMarkingAsPaid] = useState(null);

  // Create Group Form
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("Home");

  // Add Expense Form
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Add Member Form
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);

  const userName = localStorage.getItem("userName") || "Alex";
  const userEmail = localStorage.getItem("userEmail") || "alex@example.com";
  const avatar = JSON.parse(localStorage.getItem("user")).avatar;
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const categories = [
    { name: "Home", icon: Home },
    { name: "Transport", icon: Car },
    { name: "Food", icon: Utensils },
    { name: "Utilities", icon: Zap },
    { name: "Gift", icon: Gift },
    { name: "Other", icon: Users },
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupAPI.getAll();

      if (response.data.success) {
        const groupsData = response.data.data;

        // Fetch expenses for each group and calculate balances
        const groupsWithBalances = await Promise.all(
          groupsData.map(async (group) => {
            try {
              const expensesResponse = await expenseAPI.getAll({
                groupId: group._id,
              });

              const expenses = expensesResponse.data.success
                ? expensesResponse.data.data
                : [];

              // Calculate user balance in this group
              const userBalance = calculateUserBalance(
                expenses,
                currentUser?._id || currentUser?.id,
              );

              return {
                ...group,
                expenses,
                userBalance,
                totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
                expenseCount: expenses.length,
              };
            } catch (error) {
              console.error(
                `Error fetching expenses for group ${group._id}:`,
                error,
              );
              toast.error("Error fetching expenses for group");
              return {
                ...group,
                expenses: [],
                userBalance: 0,
                totalAmount: 0,
                expenseCount: 0,
              };
            }
          }),
        );

        setGroups(groupsWithBalances);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateUserBalance = (expenses, userId) => {
    let balance = 0;

    expenses.forEach((expense) => {
      if (expense.expenseType === "shared" && expense.splits) {
        const paidBy = expense.paidBy?._id || expense.paidBy;

        expense.splits.forEach((split) => {
          const splitUserId = split.user?._id || split.user;

          // User paid and someone owes them
          if (paidBy === userId && splitUserId !== userId && !split.paid) {
            balance += split.amount;
          }
          // Someone else paid and user owes them
          else if (paidBy !== userId && splitUserId === userId && !split.paid) {
            balance -= split.amount;
          }
        });
      }
    });

    return Math.round(balance * 100) / 100;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Home: Home,
      Transport: Car,
      Food: Utensils,
      Utilities: Zap,
      Gift: Gift,
      Other: Users,
    };
    return icons[category] || Users;
  };

  const getRandomColor = (index) => {
    const colors = [
      "bg-orange-500",
      "bg-yellow-500",
      "bg-teal-500",
      "bg-pink-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-cyan-500",
    ];
    return colors[index % colors.length];
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.warning("Please enter a group name");
      return;
    }

    try {
      setLoading(true);
      const response = await groupAPI.create({
        name: newGroupName,
        description: newGroupDescription || "Shared expense group",
        category: newGroupCategory,
      });

      if (response.data.success) {
        setShowCreateModal(false);
        setNewGroupName("");
        setNewGroupDescription("");
        setNewGroupCategory("Home");
        await fetchGroups();
        toast.success("Group created successfully!");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    confirm({
      title: "Delete Group?",
      message:
        "Are you sure you want to delete this group? This action cannot be undone and all expenses will be lost.",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await groupAPI.delete(groupId);

          if (response.data.success) {
            toast.info("Group deleted successfully!");
            setShowGroupDetailModal(false);
            setSelectedGroup(null);
            await fetchGroups();
          }
        } catch (error) {
          console.error("Error deleting group:", error);
          toast.error(
            `Failed to delete group: ${error.response?.data?.message || error.message}`,
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleAddExpense = async () => {
    if (
      !expenseDescription.trim() ||
      !expenseAmount ||
      selectedMembers.length === 0
    ) {
      toast.warning("Please fill in all fields and select at least one member");
      return;
    }

    try {
      setLoading(true);
      const amount = parseFloat(expenseAmount);
      const splitAmount = amount / (selectedMembers.length + 1); // +1 for the payer

      const splits = [
        {
          user: currentUser._id || currentUser.id,
          userName: currentUser.name,
          amount: splitAmount,
          paid: true,
        },
        ...selectedMembers.map((member) => ({
          user: member._id,
          userName: member.name,
          amount: splitAmount,
          paid: false,
        })),
      ];

      const expenseData = {
        description: expenseDescription,
        amount: amount,
        category: expenseCategory,
        expenseType: "shared",
        group: selectedGroup._id,
        groupName: selectedGroup.name, // âœ… ADD GROUP NAME
        splits: splits,
        paidByName: currentUser.name,
      };

      const response = await expenseAPI.create(expenseData);

      if (response.data.success) {
        setShowAddExpenseModal(false);
        setExpenseDescription("");
        setExpenseAmount("");
        setExpenseCategory("Food");
        setSelectedMembers([]);
        await fetchGroups();
        toast.success("Expense added successfully!");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error(
        `Failed to add expense: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!newMemberEmail.trim()) {
      toast.warning("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(newMemberEmail.trim())) {
      toast.warning("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/users/search?email=${encodeURIComponent(newMemberEmail.trim())}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (process.env.NODE_ENV === "development")
        console.log("Search response:", data);

      if (data.success && data.data) {
        // Check if user is already a member
        const isAlreadyMember = selectedGroup.members.some(
          (member) => member.user._id === data.data._id,
        );

        if (isAlreadyMember) {
          toast.info("This user is already a member of the group");
          setSearchedUser(null);
          return;
        }

        setSearchedUser(data.data);
      } else {
        toast.warning(`${data.message || "User not found with this email"}`);
        setSearchedUser(null);
      }
    } catch (error) {
      console.error("Error searching user:", error);
      toast.error(
        "Failed to search user. Please make sure the backend is running.",
      );
      setSearchedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!searchedUser) {
      toast.warning("Please search for a user first");
      return;
    }

    try {
      setLoading(true);
      const response = await groupAPI.addMember(
        selectedGroup._id,
        searchedUser._id,
      );

      if (response.data.success) {
        setShowAddMemberModal(false);
        setNewMemberEmail("");
        setSearchedUser(null);
        await fetchGroups();
        toast.success("Member added successfully!");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error(
        `Failed to add member: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (groupId, userId) => {
    confirm({
      title: "Remove Member?",
      message: "Are you sure you want to remove this member from the group?",
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await groupAPI.removeMember(groupId, userId);

          if (response.data.success) {
            await fetchGroups();
            toast.success("Member removed successfully!");
          }
        } catch (error) {
          console.error("Error removing member:", error);
          toast.error(
            `Failed to remove member: ${error.response?.data?.message || error.message}`,
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSettleUp = async (group) => {
    if (!currentUser || !currentUser.name) {
      toast.warning("User information not found. Please login again.");
      return;
    }

    const currentUserName = currentUser.name;

    try {
      setMarkingAsPaid(group._id);

      const expensesToUpdate = group.expenses.filter((expense) => {
        if (!expense.splits) return false;
        return expense.splits.some(
          (split) =>
            (split.userName === currentUserName ||
              split.user?.name === currentUserName) &&
            split.paid === false,
        );
      });

      if (expensesToUpdate.length === 0) {
        toast.info("No unpaid expenses found in this group.");
        setMarkingAsPaid(null);
        return;
      }

      const updatePromises = expensesToUpdate.map(async (expense) => {
        const updatedSplits = expense.splits.map((split) => {
          if (
            split.userName === currentUserName ||
            split.user?.name === currentUserName
          ) {
            return { ...split, paid: true };
          }
          return split;
        });

        return expenseAPI.update(expense._id, {
          splits: updatedSplits,
        });
      });

      await Promise.all(updatePromises);

      await fetchGroups();
      toast.success("Marked as paid! Group is now settled up.");
    } catch (error) {
      console.error("Error marking as paid:", error);
      toast.error(`Failed to mark as paid: ${error.message}`);
    } finally {
      setMarkingAsPaid(null);
    }
  };

  const openGroupDetails = (group) => {
    setSelectedGroup(group);
    setShowGroupDetailModal(true);
  };

  if (loading && groups.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-white/60">
            Loading groups...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
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
        Index={2}
        avatar={avatar}
      />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8 mt-16 lg:mt-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Groups Overview
            </h1>
            <p className="text-sm sm:text-base text-white/50">
              Manage shared expenses and track balances with friends.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Create New Group Card */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="border-2 border-dashed border-white/10 hover:border-orange-500/50 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[240px] sm:min-h-[280px] hover:bg-orange-500/5 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 flex items-center justify-center mb-3 sm:mb-4 transition-colors">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            </div>
            <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">
              Create New Group
            </h3>
            <p className="text-xs sm:text-sm text-white/50 text-center px-2">
              Start a new collection for a trip, house, or event.
            </p>
          </div>

          {/* Group Cards */}
          {groups.map((group) => {
            const Icon = getCategoryIcon(group.category || "Other");
            const status =
              group.userBalance >= 0.01
                ? "owed"
                : group.userBalance <= -0.01
                  ? "owe"
                  : "settled";

            return (
              <div
                key={group._id}
                onClick={() => openGroupDetails(group)}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/5 hover:border-orange-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-orange-500/10">
                    <Icon
                      className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Options menu
                    }}
                    className="h-8 w-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-white mb-1 text-base sm:text-lg">
                  {group.name}
                </h3>
                <p className="text-xs sm:text-sm text-white/50 mb-3 sm:mb-4 line-clamp-2">
                  {group.description}
                </p>

                {/* Members */}
                <div className="flex -space-x-2 mb-3 sm:mb-4">
                  {group.members.slice(0, 4).map((member, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getRandomColor(idx)} border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-semibold text-white`}
                    >
                      {member.user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </div>
                  ))}
                  {group.members.length > 4 && (
                    <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-medium text-white/60">
                      +{group.members.length - 4}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Total Expenses</span>
                    <span className="text-white font-semibold">
                      ₹{group.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Transactions</span>
                    <span className="text-white font-semibold">
                      {group.expenseCount}
                    </span>
                  </div>
                </div>

                {/* Balance Status */}
                <div className="pt-4 border-t border-white/5 mt-4">
                  <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">
                    Your Status
                  </p>
                  {status === "owe" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-500 font-semibold">
                          You owe ₹{Math.abs(group.userBalance).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSettleUp(group);
                        }}
                        disabled={markingAsPaid === group._id}
                        className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {markingAsPaid === group._id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Settling...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Settle Up</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {status === "owed" && (
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-semibold">
                        You are owed ₹{group.userBalance.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {status === "settled" && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-medium">
                        Settled up
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Create New Group
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Weekend Trip"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="e.g., Shared expenses for our trip"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Category
                </label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-white focus:outline-none focus:border-orange-500/50 transition-all bg-[#1a1a1a]"
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Detail Modal */}
      {showGroupDetailModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedGroup.name}
              </h2>
              <button
                onClick={() => setShowGroupDetailModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Group Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-white/50">Total</span>
                </div>
                <p className="text-xl font-bold text-white">
                  ₹ {selectedGroup.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-white/50">Expenses</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {selectedGroup.expenseCount}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-white/50">Members</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {selectedGroup.members.length}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
              <button
                onClick={() => {
                  setShowAddExpenseModal(true);
                  setShowGroupDetailModal(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
              <button
                onClick={() => {
                  setShowAddMemberModal(true);
                  setShowGroupDetailModal(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
              <button
                onClick={() => handleDeleteGroup(selectedGroup._id)}
                className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Members List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Members</h3>
              <div className="space-y-2">
                {selectedGroup.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg border border-white/10 gap-2"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                        {member.user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white text-sm sm:text-base truncate">
                          {member.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-white/50 truncate">
                          {member.user?.email || ""}
                        </p>
                      </div>
                    </div>
                    {member.role === "admin" ? (
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full">
                        Admin
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          handleRemoveMember(selectedGroup._id, member.user._id)
                        }
                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Expenses */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Recent Expenses
              </h3>
              {selectedGroup.expenses.length > 0 ? (
                <div className="space-y-2">
                  {selectedGroup.expenses.slice(0, 5).map((expense) => (
                    <div
                      key={expense._id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {expense.description}
                        </p>
                        <p className="text-xs text-white/50">
                          Paid by {expense.paidBy?.name || expense.paidByName}{" "}
                          {expense.category && (
                            <span className="px-1.5 py-0.5 text-[8px] rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-sm">
                              {expense.category}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">
                          ₹{expense.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-white/50">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/50">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No expenses yet. Add your first expense!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Add Expense to {selectedGroup.name}
              </h2>
              <button
                onClick={() => {
                  setShowAddExpenseModal(false);
                  setShowGroupDetailModal(true);
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="e.g., Dinner at restaurant"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
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
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Category
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                >
                  <option value="Food" className="bg-[#1a1a1a] text-white">
                    Food
                  </option>
                  <option value="Groceries" className="bg-[#1a1a1a] text-white">
                    Groceries
                  </option>
                  <option value="Transport" className="bg-[#1a1a1a] text-white">
                    Transport
                  </option>
                  <option value="Shopping" className="bg-[#1a1a1a] text-white">
                    Shopping
                  </option>
                  <option
                    value="Entertainment"
                    className="bg-[#1a1a1a] text-white"
                  >
                    Entertainment
                  </option>
                  <option value="Utilities" className="bg-[#1a1a1a] text-white">
                    Utilities
                  </option>
                  <option value="Bills" className="bg-[#1a1a1a] text-white">
                    Bills
                  </option>
                  <option value="Health" className="bg-[#1a1a1a] text-white">
                    Health
                  </option>
                  <option value="Travel" className="bg-[#1a1a1a] text-white">
                    Travel
                  </option>
                  <option value="Other" className="bg-[#1a1a1a] text-white">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Split with *
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedGroup.members
                    .filter(
                      (m) => m.user._id !== (currentUser._id || currentUser.id),
                    )
                    .map((member) => (
                      <label
                        key={member._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.some(
                            (m) => m._id === member.user._id,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([
                                ...selectedMembers,
                                member.user,
                              ]);
                            } else {
                              setSelectedMembers(
                                selectedMembers.filter(
                                  (m) => m._id !== member.user._id,
                                ),
                              );
                            }
                          }}
                          className="w-4 h-4 rounded border-white/20 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-white">{member.user.name}</span>
                      </label>
                    ))}
                </div>
                <p className="text-xs text-white/40 mt-2">
                  Split equally between you and {selectedMembers.length} other
                  {selectedMembers.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddExpenseModal(false);
                  setShowGroupDetailModal(true);
                }}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Add Member to {selectedGroup.name}
              </h2>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setShowGroupDetailModal(true);
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Search by Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                  />
                  <button
                    onClick={handleSearchUser}
                    disabled={loading}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? "..." : "Search"}
                  </button>
                </div>
              </div>

              {searchedUser && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                      {searchedUser.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {searchedUser.name}
                      </p>
                      <p className="text-sm text-white/50">
                        {searchedUser.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleAddMember}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add to Group"}
                  </button>
                </div>
              )}

              {!searchedUser && (
                <div className="text-center py-8 text-white/50">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    Search for a user to add them to the group
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setShowGroupDetailModal(true);
                  setNewMemberEmail("");
                  setSearchedUser(null);
                }}
                className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal />
    </div>
  );
};

export default Groups;
