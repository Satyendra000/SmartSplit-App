const express = require("express");
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} = require("../controllers/expenseController");
const auth = require("../middlewares/auth").auth;

router.get("/stats", auth, getExpenseStats);
router.get("/", auth, getExpenses);
router.get("/:id", auth, getExpense);
router.post("/", auth, createExpense);
router.put("/:id", auth, updateExpense);
router.delete("/:id", auth, deleteExpense);

module.exports = router;
