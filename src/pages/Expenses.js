import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Slider,
  Box,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { init } from '@emailjs/browser';
init({ publicKey: 'B6kjggLZL4Ik3em9h' });

const ExpensePage = () => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const navigate = useNavigate();
  const categories = ['Groceries', 'Utilities', 'Dinner', 'Transportation', 'Entertainment', 'Recreation', 'Other'];
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [expenseId, setExpenseId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dateOfExpense, setDateOfExpense] = useState(formatDate(Date.now()));
  const [amountFilter, setAmountFilter] = useState([0, 100000]); // Default amount filter values
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [yearlyBudget, setYearlyBudget] = useState(0);
  useEffect(() => {
    fetchExpenses();
    fetchBudget();
  }, []);

  useEffect(() => {
    if (isFilterApplied) {
      filterExpenses();
      setIsFilterApplied(false); // Reset the filter status after applying
    }
  }, [isFilterApplied]);
  useEffect(() => {
    setFilteredExpenses(expenses); // Initialize filteredExpenses with all expenses
  }, [expenses]);
  const fetchBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.get(`http://localhost:5000/api/users/getBudget/${username}`, { headers });
      const { monthlyBudget, yearlyBudget } = response.data;
      setMonthlyBudget(monthlyBudget);
      setYearlyBudget(yearlyBudget);
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('username');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.get(`http://localhost:5000/api/expenses?user=${user}`, { headers });
      const rows = response.data.expenses.map((expense, index) => ({
        id: index + 1,
        ...expense,
        date: formatDate(expense.date),
      }));
      setExpenses(rows);
    } catch (error) {
      if (error.response.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleOpenDialog = (row) => {
    setExpenseId(row?._id || '');
    setDescription(row?.description || '');
    setAmount(row?.amount || 0);
    setCategory(row?.category || '');
    setDateOfExpense(row?.date || Date.now);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setExpenseId('');
    setDescription('');
    setAmount(0);
    setCategory('');
    setDateOfExpense(Date.now);
    setOpenDialog(false);
  };

  const handleSaveExpense = async () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const data = {
      description,
      amount,
      category,
      date: dateOfExpense,
      user: username,
    };
    try {
      if (expenseId) {
        const response = await axios.put(`http://localhost:5000/api/expenses/${expenseId}`, data, { headers });
        if (response.status === 201) {
          toast.success("Expense updated successfully", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {
              backgroundColor: "#81c784",
              color: "#fff",
              fontWeight: "bold",
            },
          });
          fetchExpenses();
          const useremail = localStorage.getItem('useremail'); 
          if (amount + totalCurrentMonthExpenditure > monthlyBudget) {
            try {
              await emailjs.send("service_9z00s8l", "template_pbpmj49", {
                from_name: "Expense tracker",
                to_name: username,
                to_email: useremail,
                message: "You have exceeded your monthly budget limit by " + (amount + totalCurrentMonthExpenditure - monthlyBudget) + " rupees",
              });
              fetchExpenses();
            } catch (error) {
              console.error('Error sending email:', error);
            }
          }
        }
      } else {
        const response = await axios.post('http://localhost:5000/api/expenses', data, { headers });
        if (response.status === 201) {
          toast.success("Expense added successfully", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {
              backgroundColor: "#81c784",
              color: "#fff",
              fontWeight: "bold",
            },
          });
          fetchExpenses();
        }
      }
    } catch (error) {
      toast.error("Error saving expense", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          backgroundColor: "#e57373",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    }
    handleCloseDialog();
  };

  const handleDeleteExpense = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, { headers });
      fetchExpenses();
    } catch (error) {
      toast.error("Error deleting expense", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          backgroundColor: "#e57373",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    }
  };

  const filterExpenses = () => {
    let filtered = expenses.filter(expense => {
      return (
        expense.amount >= amountFilter[0] &&
        expense.amount <= amountFilter[1] &&
        (selectedCategories.length === 0 || selectedCategories.includes(expense.category))
      );
    });
    setFilteredExpenses(filtered);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'description', headerName: 'Description', width: 250 },
    { field: 'amount', headerName: 'Amount', width: 250 },
    { field: 'category', headerName: 'Category', width: 250 },
    { field: 'date', headerName: 'Date', width: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      renderCell: (params) => (
        <div>
          <IconButton onClick={() => handleOpenDialog(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteExpense(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Month is zero-based
  const currentYear = currentDate.getFullYear();

  const totalCurrentMonthExpenditure = filteredExpenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.getMonth() + 1;
    const expenseYear = expenseDate.getFullYear();

    if (expenseMonth === currentMonth && expenseYear === currentYear) {
      total += expense.amount;
    }
    return total;
  }, 0);

  // Calculate total current year expenditure
  const totalCurrentYearExpenditure = filteredExpenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.date);
    const expenseYear = expenseDate.getFullYear();

    if (expenseYear === currentYear) {
      total += expense.amount;
    }

    return total;
  }, 0);
  return (
    <div style={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Expenses
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Total Current Month Expenditure: ₹{totalCurrentMonthExpenditure.toFixed(2)} {' ('}
        <span style={{ color: monthlyBudget - totalCurrentMonthExpenditure >= 0 ? 'green' : 'red' }}>
          ₹{monthlyBudget - totalCurrentMonthExpenditure.toFixed(2)}
        </span>
        {') '}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Total Current Year Expenditure: ₹{totalCurrentYearExpenditure.toFixed(2)} {' ('}
        <span style={{ color: yearlyBudget - totalCurrentYearExpenditure >= 0 ? 'green' : 'red' }}>
          ₹{yearlyBudget - totalCurrentYearExpenditure.toFixed(2)}
        </span>
        {') '}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        style={{ marginBottom: 16 }}
      >
        Add Expense
      </Button>
      <Box width="300px" margin="0 auto"> {/* Center dropdown and slider */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="category-label">Select Categories</InputLabel>
          <Select
            labelId="category-label"
            multiple
            value={selectedCategories}
            onChange={(e) => setSelectedCategories(e.target.value)}
            renderValue={(selected) => selected.join(', ')}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography id="range-slider" gutterBottom>
          Amount Range
        </Typography>
        <Slider
          value={amountFilter}
          onChange={(event, newValue) => setAmountFilter(newValue)}
          valueLabelDisplay="auto"
          aria-labelledby="range-slider"
          min={0}
          max={1000}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsFilterApplied(true)}
          style={{ marginTop: 16 }}
        >
          Apply Filter
        </Button>
      </Box>
      <DataGrid
        rows={filteredExpenses}
        columns={columns}
        getRowId={(row) => row._id}
      />
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{expenseId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Amount"
            fullWidth
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            id="dateOfExpense"
            label="Date of Expense"
            type="date"
            value={dateOfExpense}
            onChange={(e) => setDateOfExpense(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary" startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSaveExpense} color="primary">
            {expenseId ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ExpensePage;
