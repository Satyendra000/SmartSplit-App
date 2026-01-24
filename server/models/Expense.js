// backend/models/Expense.js
// Replace your existing Expense.js with this

const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Please provide a description"],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Please provide an amount"],
    min: [0, "Amount cannot be negative"],
  },
  currency: {
    type: String,
    default: "₹",
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },
  groupName: {
    // ✅ NEW FIELD
    type: String,
    default: "",
  },
  category: {
    type: String,
    enum: [
      "Food",
      "Groceries",
      "Transport",
      "Shopping",
      "Entertainment",
      "Utilities",
      "Bills",
      "Health",
      "Travel",
      "Other",
    ],
    default: "Other",
  },
  expenseType: {
    type: String,
    enum: ["personal", "shared"],
    default: "personal",
  },
  splitType: {
    type: String,
    enum: ["equal", "custom", "percentage"],
    default: "equal",
  },
  splits: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      userName: {
        type: String,
        default: "",
      },
      amount: {
        type: Number,
        required: true,
      },
      percentage: {
        type: Number,
        default: 0,
      },
      paid: {
        type: Boolean,
        default: false,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: "",
  },
  receipt: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
ExpenseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Expense", ExpenseSchema);