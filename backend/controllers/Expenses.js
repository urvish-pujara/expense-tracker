const Expense = require('../models/Expenses');

const createExpense = async (req, res) => {
  try {
    const { description, amount, category, date, user } = req.body;
    const newExpense = new Expense({
      description,
      amount,
      category,
      date,
      user,
    });
    await newExpense.save();
    res.status(201).json({ message: 'Expense created successfully', expense: newExpense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const user = req.query.user;
    const categories = req.query.categories?.split(',') || [];
    const minAmount = parseInt(req.query.minAmount) || 0;
    const maxAmount = parseInt(req.query.maxAmount) || Infinity;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    // Prepare query conditions based on user, categories, and amount range
    const query = { user };
    if (categories?.length && categories?.length > 0 && categories[0] !== '') {
      query.category = { $in: categories };
    }
    query.amount = { $gte: minAmount, $lte: maxAmount };

    results.totalCount = await Expense.countDocuments(query);

    if (endIndex < results.totalCount) {
      results.next = {
        page: page + 1,
        limit: limit
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      };
    }

    results.expenses = await Expense.find(query).limit(limit).skip(startIndex);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date } = req.body;
    const updatedExpense = await Expense.findByIdAndUpdate(id, { description, amount, category, date }, { new: true });
    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findByIdAndDelete(id);
    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense deleted successfully', expense: deletedExpense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createExpense, getAllExpenses, getExpenseById, updateExpenseById, deleteExpenseById };
