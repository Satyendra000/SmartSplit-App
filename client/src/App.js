import { useState, useEffect, useRef } from "react";
import API_URL from "./config/api";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Users, Wallet, CheckCircle } from "lucide-react";
import { useToast } from "./hooks/useToast";
import { useConfirm } from "./components/common/ConfirmModal";
import Toast from "./components/common/Toast";
import Header from "./components/splitbill/Header";
import Sidebar from "./components/splitbill/Sidebar";
import Main from "./components/splitbill/Main";
import LoadingScreen from "./components/common/LoadingScreen";
import Welcome from "./pages/Landing/Welcome";
import Auth from "./pages/Auth/Auth";
import SplitSetup from "./pages/SplitBill/SplitSetup";
import { expenseAPI } from "./services/api";
import PersonalDashboard from "./pages/Dashboard/PersonalDashboard";
import Groups from "./pages/Dashboard/Groups";
import Expenses from "./pages/Dashboard/Expenses";
import Settings from "./pages/Dashboard/Settings";
import Reports from "./pages/Dashboard/Reports";
import ForgotPassword from "./components/splitbill/ForgotPassword";

const calculateSimplifiedSettlements = (expenses, allParticipants) => {
  if (
    !expenses ||
    expenses.length === 0 ||
    !allParticipants ||
    allParticipants.length === 0
  ) {
    return [];
  }

  const balances = {};
  allParticipants.forEach((p) => (balances[p] = 0));

  expenses.forEach((expense) => {
    if (expense.splits && expense.splits.length > 0) {
      if (expense.expenseType === "shared") {
        const payer = expense.paidByName;
        const totalAmount = expense.amount;

        if (balances[payer] !== undefined) {
          balances[payer] += totalAmount;
        }

        expense.splits.forEach((split) => {
          if (balances[split.userName] !== undefined) {
            balances[split.userName] -= split.amount;
          }
        });
      } else if (expense.expenseType === "settlement" || expense.isSettlement) {
        // Handle settlement expenses - adjust balances
        expense.splits.forEach((split) => {
          if (balances[split.userName] !== undefined) {
            balances[split.userName] += split.amount;
          }
        });
      }
    }
  });

  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([person, balance]) => {
    const roundedBalance = Math.round(balance * 100) / 100;
    if (roundedBalance > 0.01) {
      creditors.push({ person, amount: roundedBalance });
    } else if (roundedBalance < -0.01) {
      debtors.push({ person, amount: -roundedBalance });
    }
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const settleAmount = Math.min(creditor.amount, debtor.amount);

    if (settleAmount > 0.01) {
      // Use stable ID based on people involved, not timestamp
      const stableId = `${debtor.person}-to-${creditor.person}`;
      settlements.push({
        id: stableId,
        from: debtor.person,
        to: creditor.person,
        amount: Math.round(settleAmount * 100) / 100,
        text: `${debtor.person} → ${creditor.person}`,
        detail: `Pay ₹${settleAmount.toFixed(2)} to settle`,
      });
    }

    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;

    if (creditor.amount < 0.01) creditorIndex++;
    if (debtor.amount < 0.01) debtorIndex++;
  }

  return settlements;
};

const calculateNetBalances = (expenses, allParticipants) => {
  if (
    !expenses ||
    expenses.length === 0 ||
    !allParticipants ||
    allParticipants.length === 0
  ) {
    return [];
  }

  const balances = {};
  allParticipants.forEach((p) => (balances[p] = 0));

  expenses.forEach((expense) => {
    // Include both shared expenses and settlement expenses
    if (expense.splits && expense.splits.length > 0) {
      if (expense.expenseType === "shared") {
        const payer = expense.paidByName;
        const totalAmount = expense.amount;

        if (balances[payer] !== undefined) {
          balances[payer] += totalAmount;
        }

        expense.splits.forEach((split) => {
          if (balances[split.userName] !== undefined) {
            balances[split.userName] -= split.amount;
          }
        });
      } else if (expense.expenseType === "settlement" || expense.isSettlement) {
        // Handle settlement expenses
        expense.splits.forEach((split) => {
          if (balances[split.userName] !== undefined) {
            balances[split.userName] += split.amount;
          }
        });
      }
    }
  });

  const result = Object.entries(balances)
    .map(([person, balance]) => ({
      person,
      balance: Math.round(balance * 100) / 100,
    }))
    .filter((item) => Math.abs(item.balance) > 0.01);

  return result;
};

const calculateYourSettlements = (expenses, allParticipants) => {
  if (
    !expenses ||
    expenses.length === 0 ||
    !allParticipants ||
    allParticipants.length === 0
  ) {
    return [];
  }

  const you = allParticipants[0];
  const yourDebts = {};

  allParticipants.slice(1).forEach((person) => {
    yourDebts[person] = 0;
  });

  expenses.forEach((expense) => {
    if (expense.splits && expense.splits.length > 0) {
      if (expense.expenseType === "shared") {
        const payer = expense.paidByName;

        expense.splits.forEach((split) => {
          if (
            payer === you &&
            split.userName !== you &&
            yourDebts[split.userName] !== undefined
          ) {
            yourDebts[split.userName] += split.amount;
          }
          if (
            payer !== you &&
            split.userName === you &&
            yourDebts[payer] !== undefined
          ) {
            yourDebts[payer] -= split.amount;
          }
        });
      } else if (expense.expenseType === "settlement" || expense.isSettlement) {
        // Handle settlement expenses
        expense.splits.forEach((split) => {
          if (
            split.userName === you &&
            yourDebts[expense.paidByName] !== undefined
          ) {
            // You received a settlement
            yourDebts[expense.paidByName] -= split.amount;
          } else if (
            expense.paidByName === you &&
            split.userName !== you &&
            yourDebts[split.userName] !== undefined
          ) {
            // You paid a settlement
            yourDebts[split.userName] += split.amount;
          }
        });
      }
    }
  });

  const result = Object.entries(yourDebts)
    .map(([person, amount]) => ({
      person,
      amount: Math.round(amount * 100) / 100,
    }))
    .filter((item) => Math.abs(item.amount) > 0.01);

  return result;
};

const calculateCreditors = (expenses, allParticipants) => {
  if (
    !expenses ||
    expenses.length === 0 ||
    !allParticipants ||
    allParticipants.length === 0
  ) {
    return [];
  }

  const balances = {};
  allParticipants.forEach((p) => (balances[p] = 0));

  expenses.forEach((expense) => {
    if (expense.splits && expense.splits.length > 0) {
      if (expense.expenseType === "shared") {
        const payer = expense.paidByName;
        const totalAmount = expense.amount;

        if (balances[payer] !== undefined) {
          balances[payer] += totalAmount;
        }

        expense.splits.forEach((split) => {
          if (balances[split.userName] !== undefined) {
            balances[split.userName] -= split.amount;
          }
        });
      } else if (expense.expenseType === "settlement" || expense.isSettlement) {
        // Handle settlement expenses
        expense.splits.forEach((split) => {
          if (balances[split.userName] !== undefined) {
            balances[split.userName] += split.amount;
          }
        });
      }
    }
  });

  const creditors = Object.entries(balances)
    .map(([person, balance]) => ({
      person,
      amount: Math.round(balance * 100) / 100,
    }))
    .filter((item) => item.amount > 0.01);

  return creditors;
};

// Dashboard Component with Session Support
const Dashboard = ({ appMode, toast }) => {
  const [activeTab, setActiveTab] = useState("groups");
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm, ConfirmModal } = useConfirm();
  const loadedSessionRef = useRef(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [participants, setParticipants] = useState([]);
  const [expenseType, setExpenseType] = useState("shared");
  const [category, setCategory] = useState("Food");
  const [paidBy, setPaidBy] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allParticipants, setAllParticipants] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [settledPayments, setSettledPayments] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0); // Force re-render trigger
  const [isAdmin, setIsAdmin] = useState(false);

  // Load session data from backend
  const loadSessionData = async (sessionId) => {
    // Prevent duplicate loading of the same session
    if (loadedSessionRef.current === sessionId) return;
    loadedSessionRef.current = sessionId;

    try {
      setLoading(true);
      
      // Check admin rights from localStorage
      const adminFlag = localStorage.getItem(`split_session_admin_${sessionId}`);
      setIsAdmin(adminFlag === "true");

      // Fetch from backend API
      const response = await fetch(`${API_URL}/api/sessions/${sessionId}`);
      const data = await response.json();

      if (data.success) {
        const session = data.data;

        // Check if session is expired (backend also checks, but double-check)
        if (new Date(session.expiresAt) < new Date()) {
          toast.warning(
            "This session has expired. Please create a new session.",
          );
          navigate("/split-setup");
          return;
        }

        // Load session data
        setSessionInfo(session);
        setAllParticipants(session.participants);
        setExpenses(session.expenses || []);
        setSettledPayments(session.settledPayments || []);
        setPaidBy(session.participants[0]);
        setCurrentSessionId(sessionId);

        toast.success(`Session "${session.groupName}" loaded successfully!`);
      } else {
        toast.error("Session not found. Please check the link.");
        navigate("/split-setup");
      }
    } catch (error) {
      console.error("Error loading session:", error);
      toast.error("Failed to load session. Please try again.");
      navigate("/split-setup");
    } finally {
      setLoading(false);
    }
  };

  // Save session data to backend
  const saveSessionData = async (
    sessionId,
    updatedExpenses,
    updatedSettlements = null,
  ) => {
    try {
      const payload = {
        expenses: updatedExpenses,
      };

      if (updatedSettlements !== null) {
        payload.settledPayments = updatedSettlements;
      }

      const response = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if(process.env.NODE_ENV === 'development') console.log("✅ Session saved to backend");
      } else {
        console.error("Failed to save session:", data.message);
        toast.error("Failed to save session data");
      }
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session data");
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get("session");

    if (appMode === "split") {
      if (sessionId) {
        // Load from shared session
        loadSessionData(sessionId);
      } else {
        // No session, redirect to setup page
        navigate("/split-setup");
      }
    } else if (appMode === "personal") {
      const token = localStorage.getItem("token");
      if (token) {
        fetchExpenses();
      } else {
        navigate("/");
      }
    }
  }, [appMode, location.search, navigate]);

  const fetchExpenses = async () => {
    if (appMode !== "personal") return;
    try {
      setLoading(true);
      const response = await expenseAPI.getAll();
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (err) {
      console.error("❌ Error fetching expenses:", err);
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!description || !amount || !paidBy) {
      toast.warning("Please fill in all fields");
      return;
    }

    if (expenseType === "shared" && participants.length === 0) {
      toast.warning("Please select people to split with");
      return;
    }

    if (appMode === "split") {
      const newExpense = {
        _id: Date.now().toString(),
        description,
        amount: Number.parseFloat(amount),
        category,
        expenseType,
        paidByName: paidBy,
        date: new Date().toISOString(),
        splits:
          expenseType === "shared"
            ? participants.map((person) => ({
                userName: person,
                amount: Number.parseFloat(amount) / participants.length,
                paid: person === paidBy,
              }))
            : [],
      };

      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);

      // Save to session if using session mode
      if (currentSessionId) {
        await saveSessionData(
          currentSessionId,
          updatedExpenses,
          settledPayments,
        );
      }

      setDescription("");
      setAmount("");
      setParticipants([]);
      setCategory("Food");
      toast.success("Expense added successfully!");
      return;
    }

    try {
      setLoading(true);
      const splitWith =
        expenseType === "shared"
          ? participants
          : [];

      const expenseData = {
        description,
        amount: Number.parseFloat(amount),
        category,
        expenseType,
        paidByName: paidBy,
        splits: splitWith.map((person) => ({
          userName: person,
          amount: Number.parseFloat(
            (Number.parseFloat(amount) / splitWith.length).toFixed(2),
          ),
          paid: person === paidBy,
        })),
      };

      const response = await expenseAPI.create(expenseData);
      if (response.data.success) {
        setDescription("");
        setAmount("");
        setParticipants([]);
        setCategory("Food");
        await fetchExpenses();
        toast.success("Expense added successfully!");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (expenseId) => {
    if (!isAdmin) {
      toast.error("Only admin can delete expenses");
      return;
    }

    confirm({
      title: "Delete Expense?",
      message: "Are you sure you want to delete this expense?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        const updatedExpenses = expenses.filter((exp) => exp._id !== expenseId);
        setExpenses(updatedExpenses);

        if (currentSessionId) {
          await saveSessionData(
            currentSessionId,
            updatedExpenses,
            settledPayments
          );
        }
        toast.success("Expense deleted successfully");
      },
    });
  };

  // Handle Edit Expense
  const handleEditExpense = async (updatedExpense) => {
    const updatedExpenses = expenses.map((exp) =>
      exp._id === updatedExpense._id ? updatedExpense : exp
    );
    setExpenses(updatedExpenses);

    if (currentSessionId) {
      await saveSessionData(
        currentSessionId,
        updatedExpenses,
        settledPayments
      );
    }
    toast.success("Expense updated successfully");
  };

  // Handle settlement payment
  const handleSettlementPaid = async (payment) => {
    confirm({
      title: "Confirm Settlement",
      message: `Are you sure ${payment.from} has paid ₹${payment.amount.toFixed(2)} to ${payment.to}?`,
      confirmText: "Yes, Mark as Paid",
      cancelText: "Cancel",
      type: "success",
      onConfirm: async () => {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "✅ Settling payment:",
            `${payment.from} → ${payment.to}: ₹${payment.amount}`
          );
        }

        // Create a settlement expense to record the payment
        const settlementExpense = {
          _id: `settlement-${Date.now()}`,
          description: `Settlement: ${payment.from} paid ${payment.to}`,
          amount: payment.amount,
          category: "Settlement",
          expenseType: "settlement",
          paidByName: payment.from,
          date: new Date().toISOString(),
          splits: [
            {
              userName: payment.from,
              amount: payment.amount,
              paid: true,
            },
            {
              userName: payment.to,
              amount: -payment.amount,
              paid: false,
            },
          ],
          isSettlement: true,
        };

        // Update expenses with settlement
        const updatedExpenses = [settlementExpense, ...expenses];

        // Update settled payments list with stable ID
        const updatedSettlements = [...settledPayments, payment.id];

        if (process.env.NODE_ENV === "development") {
          console.log("✅ Payment marked as settled:", payment.id);
        }

        // Update states
        setExpenses(updatedExpenses);
        setSettledPayments(updatedSettlements);
        setUpdateTrigger((prev) => prev + 1); // Force re-render

        // Save to session
        if (currentSessionId) {
          await saveSessionData(
            currentSessionId,
            updatedExpenses,
            updatedSettlements,
          );
        }

        toast.success("Payment marked as settled!");
      },
    });
  };

  const handleNotifySettlement = async () => {
    if (!currentSessionId) {
      toast.error("No active session");
      return;
    }

    // Get stored emails from localStorage
    const storedEmails = localStorage.getItem(`split_session_emails_${currentSessionId}`);
    const participantEmails = storedEmails ? JSON.parse(storedEmails) : [];

    confirm({
      title: "Send Settlement Reminders?",
      message: participantEmails.length === 0 
        ? "No email addresses available. Please add emails when creating the session."
        : "This will send email notifications to participants who owe money and have email addresses. Continue?",
      confirmText: participantEmails.length === 0 ? "OK" : "Yes, Send Reminders",
      cancelText: participantEmails.length === 0 ? null : "Cancel",
      type: participantEmails.length === 0 ? "warning" : "info",
      onConfirm: async () => {
        if (participantEmails.length === 0) {
          return; // Just close the dialog
        }

        try {
          setLoading(true);
          const settlements = calculateSimplifiedSettlements(expenses, allParticipants);

          const response = await fetch(`${API_URL}/api/sessions/${currentSessionId}/notify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              settlements,
              participantEmails,
            }),
          });

          const data = await response.json();

          if (data.success) {
            toast.success(data.message || "Reminders sent successfully!");
          } else {
            toast.error(data.message || "Failed to send reminders");
          }
        } catch (error) {
          console.error("Error sending reminders:", error);
          toast.error("Failed to send reminders. Please try again.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const formatActivityTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const expenseDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (expenseDate.getTime() === today.getTime()) {
      return `${timeStr}, Today`;
    } else if (expenseDate.getTime() === yesterday.getTime()) {
      return `${timeStr}, Yesterday`;
    } else {
      const dateStr = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
      return `${dateStr} at ${timeStr}`;
    }
  };

  const summaryData = {
    totalExpenses: expenses
      .filter((exp) => exp.expenseType === "shared")
      .reduce((sum, exp) => sum + exp.amount, 0),
    youPaid: expenses
      .filter(
        (exp) =>
          exp.paidByName === allParticipants[0] && exp.expenseType === "shared",
      )
      .reduce((sum, exp) => sum + exp.amount, 0),
    youOwe: 0,
    othersOweYou: 0,
  };

  const activities = expenses.slice(0, 10).map((expense) => ({
    id: expense._id,
    icon: expense.isSettlement
      ? CheckCircle
      : expense.expenseType === "shared"
        ? Users
        : Wallet,
    text: expense.isSettlement
      ? `${expense.paidByName} settled payment with ${expense.splits?.find((s) => s.userName !== expense.paidByName)?.userName || "someone"} ₹${expense.amount}`
      : `${expense.paidByName || "Someone"} paid '${expense.description}' ₹${expense.amount} (${expense.expenseType})`,
    color: expense.isSettlement ? "emerald" : "orange",
    time: formatActivityTime(expense.date),
    isSettlement: expense.isSettlement,
  }));

  const payments = calculateSimplifiedSettlements(expenses, allParticipants);
  const netBalances = calculateNetBalances(expenses, allParticipants);
  const yourSettlements = calculateYourSettlements(expenses, allParticipants);
  const creditors = calculateCreditors(expenses, allParticipants);

  const yourBalance =
    netBalances?.find((b) => b.person === allParticipants?.[0])?.balance || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading session...</p>
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

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full">
          {/* Session Info Banner */}
          {sessionInfo && (
            <div className="bg-orange-500/10 border-b border-orange-500/20 px-6 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-400">
                  📊 Session: <strong>{sessionInfo.groupName}</strong>
                </span>
                <span className="text-orange-400/70">
                  Expires:{" "}
                  {new Date(sessionInfo.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <Header activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <Sidebar
              description={description}
              setDescription={setDescription}
              amount={amount}
              setAmount={setAmount}
              expenseType={expenseType}
              setExpenseType={setExpenseType}
              participants={participants}
              setParticipants={setParticipants}
              handleAddExpense={handleAddExpense}
              category={category}
              setCategory={setCategory}
              paidBy={paidBy}
              setPaidBy={setPaidBy}
              allParticipants={allParticipants}
            />

            <Main
              activities={activities}
              payments={payments}
              activeTab={activeTab}
              expenses={expenses}
              summaryData={summaryData}
              participants={allParticipants}
              netBalances={netBalances}
              yourSettlements={yourSettlements}
              creditors={creditors}
              yourBalance={yourBalance}
              onSettlementPaid={handleSettlementPaid}
              settledPayments={settledPayments}
              updateTrigger={updateTrigger}
              isAdmin={isAdmin}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={handleEditExpense}
              onNotifySettlement={handleNotifySettlement}
              key={`main-${updateTrigger}`}
            />
          </div>
        </div>
      </div>

      <ConfirmModal />
    </div>
  );
};

// Main App Component with Router
const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isStart = location.pathname === "/";

  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading && isStart) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/auth" element={<Auth toast={toast} />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword toast={toast} />}
        />
        <Route path="/split-setup" element={<SplitSetup toast={toast} />} />
        <Route
          path="/dashboard/split"
          element={<Dashboard appMode="split" toast={toast} />}
        />
        <Route
          path="/dashboard/personal"
          element={<PersonalDashboard toast={toast} />}
        />
        <Route
          path="/dashboard/expenses"
          element={<Expenses toast={toast} />}
        />
        <Route path="/dashboard/groups" element={<Groups toast={toast} />} />
        <Route path="/dashboard/reports" element={<Reports toast={toast} />} />
        <Route
          path="/dashboard/settings"
          element={<Settings toast={toast} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
};

export default App;