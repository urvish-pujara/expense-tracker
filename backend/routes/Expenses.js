const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/Expenses');

router.post('/', ExpenseController.createExpense);
router.get('/', ExpenseController.getAllExpenses);
router.get('/:id', ExpenseController.getExpenseById);
router.put('/:id', ExpenseController.updateExpenseById);
router.delete('/:id', ExpenseController.deleteExpenseById);

module.exports = router;
