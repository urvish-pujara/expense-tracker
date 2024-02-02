const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/Expenses');
const { authenticateUser } = require('../middleware/authenticateUser');
// router.use(authenticateUser);
router.post('/', authenticateUser, ExpenseController.createExpense);
router.get('/', authenticateUser, ExpenseController.getAllExpenses);
router.get('/:id', authenticateUser, ExpenseController.getExpenseById);
router.put('/:id', authenticateUser, ExpenseController.updateExpenseById);
router.delete('/:id', authenticateUser, ExpenseController.deleteExpenseById);

module.exports = router;
