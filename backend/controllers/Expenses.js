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
    const expenses = await Expense.find({ user: req.query.user });
    res.status(200).json({ expenses });
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
