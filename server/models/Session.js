const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

const expenseSchema = new mongoose.Schema({
  _id: String,
  description: String,
  amount: Number,
  category: String,
  expenseType: String,
  paidByName: String,
  date: Date,
  splits: [splitSchema],
  isSettlement: {
    type: Boolean,
    default: false,
  },
});

const sessionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    groupName: {
      type: String,
      required: true,
    },
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    expenses: [expenseSchema],
    settledPayments: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    durationDays: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);


sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);