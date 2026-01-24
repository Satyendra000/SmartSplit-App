import {
  TrendingUp,
  Activity,
  CreditCard,
  Clock,
  Wallet,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import NetworkGraph from "./NetworkGraph";
import Reports from "./Reports";

const MainContent = ({
  activities,
  payments,
  activeTab,
  expenses,
  summaryData,
  participants,
  creditors,
  yourBalance,
  onSettlementPaid,
  settledPayments = [],
  updateTrigger = 0,
}) => {
  const [showPaidAnimation, setShowPaidAnimation] = useState(null);
  const [localSettledPayments, setLocalSettledPayments] =
    useState(settledPayments);

  // Update local state when props change
  useEffect(() => {
    setLocalSettledPayments(settledPayments);
  }, [settledPayments, updateTrigger]);

  const handleMarkAsPaid = (payment) => {
    // Update local state immediately for UI feedback
    const newSettled = [...localSettledPayments, payment.id];
    setLocalSettledPayments(newSettled);

    // Show animation
    setShowPaidAnimation(payment.id);
    setTimeout(() => setShowPaidAnimation(null), 2000);

    // Call parent callback to add settlement expense
    if (onSettlementPaid) {
      onSettlementPaid(payment);
    }
  };

  const isPaymentSettled = (paymentId) => {
    return localSettledPayments.includes(paymentId);
  };

  if (activeTab === "reports") {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <Reports
            expenses={expenses}
            summaryData={summaryData}
            yourBalance={yourBalance}
          />
        </div>
      </main>
    );
  }

  const isAllSettled = !creditors || creditors.length === 0;

  const filteredCreditors =
    creditors?.filter((c) => c.person !== participants[0]) || [];

  return (
    <main className="flex-1 overflow-y-auto">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(249, 115, 22, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(249, 115, 22, 0.5);
        }
      `}</style>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Expenses */}
          <div className="group relative bg-gradient-to-br from-orange-500/10 to-transparent backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                  ALL TIME
                </span>
              </div>
              <h3 className="text-sm font-medium text-white/60 mb-1">
                Total Expenses
              </h3>
              <p className="text-3xl font-bold text-white">
                ₹{summaryData?.totalExpenses?.toFixed(2) || "0.00"}
              </p>
              <p className="text-sm text-white/40 mt-2">
                {expenses?.length || 0} transactions
              </p>
            </div>
          </div>

          {/* You Paid */}
          <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-white/60 mb-1">You Paid</h3>
            <p className="text-3xl font-bold text-white">
              ₹{summaryData?.youPaid?.toFixed(2) || "0.00"}
            </p>
            <p className="text-sm text-blue-400 mt-2">Your contribution</p>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${
                  isAllSettled
                    ? "bg-emerald-500/10"
                    : yourBalance > 0
                    ? "bg-emerald-500/10"
                    : "bg-red-500/10"
                } rounded-xl flex items-center justify-center`}
              >
                {isAllSettled ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                ) : yourBalance > 0 ? (
                  <ArrowDownRight className="w-6 h-6 text-emerald-400" />
                ) : (
                  <ArrowUpRight className="w-6 h-6 text-red-400" />
                )}
              </div>
            </div>
            <h3 className="text-sm font-medium text-white/60 mb-1">
              Net Balance
            </h3>
            {isAllSettled ? (
              <>
                <p className="text-3xl font-bold text-emerald-400">₹0.00</p>
                <p className="text-sm text-emerald-400 mt-2">All settled</p>
              </>
            ) : (
              <>
                <p
                  className={`text-3xl font-bold ${
                    yourBalance > 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {yourBalance > 0 ? "+" : ""}₹
                  {Math.abs(yourBalance).toFixed(2)}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    yourBalance > 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {yourBalance > 0 ? "You will receive" : "You owe"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Graph - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full hover:border-orange-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Debt Network
                  </h2>
                  <p className="text-sm text-white/50">
                    Visual debt relationships
                  </p>
                </div>
              </div>
              <NetworkGraph expenses={expenses} participants={participants} />
            </div>
          </div>

          {/* Recent Activity - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full hover:border-orange-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Activity
                  </h2>
                  <p className="text-sm text-white/50">Recent transactions</p>
                </div>
                {activities && activities.length > 0 && (
                  <span className="text-xs font-semibold bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-full border border-orange-500/20">
                    {activities.length}
                  </span>
                )}
              </div>

              {activities && activities.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {activities.map((activity) => {
                    const Icon = activity.icon;
                    const isSettlement = activity.isSettlement;
                    return (
                      <div
                        key={activity.id}
                        className={`group relative rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                          isSettlement
                            ? "bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                            : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isSettlement
                                ? "bg-emerald-500/10"
                                : "bg-orange-500/10"
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 ${
                                isSettlement
                                  ? "text-emerald-500"
                                  : "text-orange-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm transition-colors line-clamp-2 ${
                                isSettlement
                                  ? "text-emerald-400/90 group-hover:text-emerald-400"
                                  : "text-white/80 group-hover:text-white"
                              }`}
                            >
                              {activity.text}
                            </p>
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-white/40">
                              <Clock className="w-3 h-3" />
                              <span>{activity.time || "Just now"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-orange-500/20">
                    <Activity className="w-8 h-8 text-orange-500/50" />
                  </div>
                  <p className="text-white/50 font-medium mb-2">
                    No activity yet
                  </p>
                  <p className="text-sm text-white/30 text-center">
                    Add expenses to see activity
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Money to Return
                  </h2>
                  <p className="text-sm text-white/50">
                    People who will receive money back
                  </p>
                </div>
              </div>

              {filteredCreditors && filteredCreditors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCreditors.map((item) => (
                    <div
                      key={item.person}
                      className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                          <ArrowDownRight className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white">
                            {item.person}
                          </p>
                          <p className="text-xs text-emerald-400">
                            will receive
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-emerald-400">
                            ₹{item.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-400 mb-2">
                    All Settled!
                  </p>
                  <p className="text-sm text-white/40">
                    No pending balances with anyone
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Settlement Plan with Paid Feature - Full width */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Settlement Plan
                  </h2>
                  <p className="text-sm text-white/50">
                    Optimized payment suggestions
                  </p>
                </div>
                {payments && payments.length > 0 && (
                  <span className="text-xs font-semibold bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-full border border-orange-500/20">
                    {payments.filter((p) => !isPaymentSettled(p.id)).length}{" "}
                    pending
                  </span>
                )}
              </div>

              {payments && payments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {payments.map((payment) => {
                    const settled = isPaymentSettled(payment.id);
                    const animating = showPaidAnimation === payment.id;

                    return (
                      <div
                        key={payment.id}
                        className={`group relative rounded-xl p-4 transition-all duration-300 overflow-hidden ${
                          settled
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30"
                        }`}
                      >
                        {/* Paid Animation */}
                        {animating && (
                          <div className="absolute inset-0 bg-emerald-500/20 animate-pulse z-10 rounded-xl"></div>
                        )}

                        {/* Settled Badge */}
                        {settled && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                              <Check className="w-3 h-3" />
                              PAID
                            </div>
                          </div>
                        )}

                        <div className="relative z-0">
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                settled
                                  ? "bg-emerald-500/20"
                                  : "bg-orange-500/10"
                              }`}
                            >
                              {settled ? (
                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                              ) : (
                                <Wallet className="w-6 h-6 text-orange-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-semibold text-sm ${
                                  settled
                                    ? "text-emerald-400 line-through"
                                    : "text-white"
                                }`}
                              >
                                {payment.text}
                              </p>
                              <p
                                className={`text-xs ${
                                  settled
                                    ? "text-emerald-400/60"
                                    : "text-white/40"
                                }`}
                              >
                                {settled ? "Payment completed" : payment.detail}
                              </p>
                            </div>
                          </div>

                          {/* Amount */}
                          <div
                            className={`mb-3 px-3 py-2 rounded-lg ${
                              settled ? "bg-emerald-500/10" : "bg-orange-500/10"
                            }`}
                          >
                            <p
                              className={`text-2xl font-bold text-center ${
                                settled ? "text-emerald-400" : "text-orange-400"
                              }`}
                            >
                              ₹{payment.amount.toFixed(2)}
                            </p>
                          </div>

                          {/* Action Button */}
                          {!settled ? (
                            <button
                              onClick={() => handleMarkAsPaid(payment)}
                              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Mark as Paid
                            </button>
                          ) : (
                            <div className="w-full py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold rounded-lg flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Settled
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
                    <CreditCard className="w-8 h-8 text-emerald-500/50" />
                  </div>
                  <p className="text-white/50 font-medium mb-2">
                    All Settled Up!
                  </p>
                  <p className="text-sm text-white/30">No pending payments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;