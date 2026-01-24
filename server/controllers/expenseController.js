const Expense = require("../models/Expense");
const Group = require("../models/Group");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper function to transform expense for frontend
const transformExpense = (expense) => {
  const expenseObj = expense.toObject ? expense.toObject() : expense;

  // Add paidByName from populated paidBy
  if (expenseObj.paidBy && expenseObj.paidBy.name) {
    expenseObj.paidByName = expenseObj.paidBy.name;
  } else if (expenseObj.paidByName) {
    // Keep if already exists
  } else {
    expenseObj.paidByName = "";
  }

  // Add groupName from populated group
  if (expenseObj.group && expenseObj.group.name) {
    expenseObj.groupName = expenseObj.group.name;
  } else if (expenseObj.groupName) {
    // Keep if already exists
  }

  // Add userName to splits if populated
  if (expenseObj.splits && Array.isArray(expenseObj.splits)) {
    expenseObj.splits = expenseObj.splits.map((split) => {
      if (split.user && split.user.name && !split.userName) {
        split.userName = split.user.name;
      }
      return split;
    });
  }

  return expenseObj;
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { groupId, startDate, endDate, category } = req.query;
    const userId = req.user.id;

    let query = {};

    // Filter by group
    if (groupId) {
      query.group = groupId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Get all expenses where user is involved (paidBy or in splits)
    const expenses = await Expense.find(query)
      .populate("paidBy", "name email avatar")
      .populate("splits.user", "name email avatar")
      .populate("group", "name")
      .sort({ date: -1 });

    // Filter expenses where user is involved
    const userExpenses = expenses.filter((exp) => {
      const isPaidBy = exp.paidBy && exp.paidBy._id.toString() === userId;
      const isInSplits =
        exp.splits &&
        exp.splits.some(
          (split) => split.user && split.user._id.toString() === userId,
        );
      return isPaidBy || isInSplits;
    });

    // Transform expenses for frontend
    const transformedExpenses = userExpenses.map(transformExpense);

    res.json({
      success: true,
      count: transformedExpenses.length,
      data: transformedExpenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("paidBy", "name email avatar")
      .populate("splits.user", "name email avatar")
      .populate("group", "name description");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const transformedExpense = transformExpense(expense);

    res.json({
      success: true,
      data: transformedExpense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const {
      description,
      amount,
      category,
      expenseType,
      group,
      groupName,
      splits,
      paidByName,
    } = req.body;

    // Validate required fields
    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: "Please provide description and amount",
      });
    }

    // Process splits: convert userName to user ObjectId if needed
    let processedSplits = [];
    if (splits && Array.isArray(splits)) {
      for (const split of splits) {
        let userId = split.user;

        // If userName is provided but user ID is not, try to find user
        if (split.userName && !userId) {
          const user = await User.findOne({ name: split.userName });
          if (user) {
            userId = user._id;
          } else {
            // If user not found, use current user
            userId = req.user.id;
          }
        }

        // If still no userId, use current user
        if (!userId) {
          userId = req.user.id;
        }

        processedSplits.push({
          user: userId,
          userName: split.userName || "",
          amount: split.amount,
          percentage: split.percentage || 0,
          paid: split.paid || false,
        });
      }
    }

    // Determine paidBy: use req.user.id (from token) as primary source
    let paidByUserId = req.user.id;

    // Create expense
    const expense = await Expense.create({
      description,
      amount,
      category: category || "Other",
      expenseType: expenseType || "personal",
      paidBy: paidByUserId,
      group: group || null,
      groupName: groupName || "", // ✅ ADD THIS
      splits: processedSplits,
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name email avatar")
      .populate("splits.user", "name email avatar")
      .populate("group", "name");

    const transformedExpense = transformExpense(populatedExpense);

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: transformedExpense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Check ownership - allow updates if user is paidBy OR in the splits
    const isPaidBy = expense.paidBy.toString() === req.user.id;
    const isInSplits = expense.splits.some(
      (split) => split.user.toString() === req.user.id,
    );

    if (!isPaidBy && !isInSplits) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this expense",
      });
    }

    // Process splits if provided
    let updateData = { ...req.body };
    if (req.body.splits && Array.isArray(req.body.splits)) {
      const processedSplits = [];
      for (const split of req.body.splits) {
        let userId = split.user;
        if (split.userName && !userId) {
          const user = await User.findOne({ name: split.userName });
          if (user) {
            userId = user._id;
          }
        }
        processedSplits.push({
          user: userId || split.user,
          userName: split.userName || "",
          amount: split.amount,
          percentage: split.percentage || 0,
          paid: split.paid !== undefined ? split.paid : false,
        });
      }
      updateData.splits = processedSplits;
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("paidBy", "name email avatar")
      .populate("splits.user", "name email avatar");

    const transformedExpense = transformExpense(expense);

    res.json({
      success: true,
      message: "Expense updated successfully",
      data: transformedExpense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Check ownership
    if (expense.paidBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this expense",
      });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
exports.getExpenseStats = async (req, res) => {
  try {
    const { groupId } = req.query;
    const userId = req.user.id;

    // Build match query
    const matchQuery = {
      $or: [
        { paidBy: new mongoose.Types.ObjectId(userId) },
        { "splits.user": new mongoose.Types.ObjectId(userId) },
      ],
    };

    // Add group filter if provided
    if (groupId) {
      matchQuery.group = new mongoose.Types.ObjectId(groupId);
    }

    const stats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalExpenses = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        byCategory: stats,
        total: totalExpenses[0] || { total: 0, count: 0 },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export the helper function as well
exports.transformExpense = transformExpense;