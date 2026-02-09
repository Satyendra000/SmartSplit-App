import { useState, useEffect } from "react";
import { User, Save, X, UsersIcon } from "lucide-react";

const EditExpenseModal = ({
  expense,
  onSave,
  onClose,
  allParticipants,
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseType, setExpenseType] = useState("shared");
  const [category, setCategory] = useState("Food");
  const [paidBy, setPaidBy] = useState("");
  const [participants, setParticipants] = useState([]);

  // Load expense data when modal opens
  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount);
      setExpenseType(expense.expenseType);
      setCategory(expense.category);
      setPaidBy(expense.paidByName);
      
      if (expense.expenseType === "shared") {
        const splitParticipants = expense.splits.map(s => s.userName);
        setParticipants(splitParticipants);
      } else {
        setParticipants([]);
      }
    }
  }, [expense]);

  const handleSave = () => {
    if (!description || !amount || !paidBy) return;

    if (expenseType === "shared" && participants.length === 0) return;

    const updatedExpense = {
      ...expense,
      description,
      amount: Number.parseFloat(amount),
      category,
      expenseType,
      paidByName: paidBy,
      splits: expenseType === "shared"
        ? participants.map((person) => ({
            userName: person,
            amount: Number.parseFloat(amount) / participants.length,
            paid: person === paidBy,
          }))
        : [],
    };

    onSave(updatedExpense);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Expense</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g., Dinner at restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all text-lg font-semibold"
                />
              </div>
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjZjk3MzE2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="" className="bg-[#0a0a0a]">
                  Select who paid
                </option>
                {allParticipants &&
                  allParticipants.map((person, index) => (
                    <option key={index} value={person} className="bg-[#0a0a0a]">
                      {person}
                    </option>
                  ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "Food",
                  "Transport",
                  "Shopping",
                  "Bills",
                  "Entertainment",
                  "Other",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                      category === cat
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:border-orange-500/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-[#0a0a0a] text-white/40 text-xs font-semibold uppercase tracking-wider">
                  Split Type
                </span>
              </div>
            </div>

            {/* Expense Type */}
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
              <button
                onClick={() => setExpenseType("personal")}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  expenseType === "personal"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setExpenseType("shared")}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  expenseType === "shared"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                Shared
              </button>
            </div>

            {/* Split With */}
            {expenseType === "shared" && (
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-orange-500" />
                  Split With
                </label>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                  {allParticipants && allParticipants.length > 0 ? (
                    allParticipants.map((person, index) => (
                      <label
                        key={index}
                        className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-lg transition-all duration-300 ${
                          participants.includes(person)
                            ? "bg-orange-500/10 border border-orange-500/30"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={participants.includes(person)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setParticipants([...participants, person]);
                            } else {
                              setParticipants(
                                participants.filter((p) => p !== person)
                              );
                            }
                          }}
                          className="w-5 h-5 text-orange-500 bg-white/5 border-white/20 rounded focus:ring-orange-500/50 accent-orange-500"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-orange-500" />
                          </div>
                          <span className="text-sm text-white/80 font-medium">
                            {person}
                          </span>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-white/40 text-center py-4">
                      No participants added yet
                    </p>
                  )}
                </div>
                {participants.length > 0 && (
                  <div className="mt-3 px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <p className="text-xs text-orange-400 font-semibold">
                      Splitting among {participants.length}{" "}
                      {participants.length === 1 ? "person" : "people"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
