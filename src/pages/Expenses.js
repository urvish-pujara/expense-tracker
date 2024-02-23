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
  const [expenseId, setExpenseId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dateOfExpense, setDateOfExpense] = useState(formatDate(Date.now()));
  const [amountFilter, setAmountFilter] = useState([0, 100000]); // Default amount filter values
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [yearlyBudget, setYearlyBudget] = useState(0);
  const [totalCurrentMonthExpenditure, setTotalCurrentMonthExpenditure] = useState(0);
  const [totalCurrentYearExpenditure, setTotalCurrentYearExpenditure] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [fetchex, setFetchex] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchBudget();
    setIsFilterApplied(false);
  }, [page, pageSize, isFilterApplied, fetchex]); // Reload expenses when page or page size changes

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
      const expenditureResponse = await axios.get(`http://localhost:5000/api/expenses/expenditure/${username}`, { headers });
      const { totalMonthlyExpenditure, totalYearlyExpenditure } = expenditureResponse.data;
      setTotalCurrentMonthExpenditure(parseInt(totalMonthlyExpenditure));
      setTotalCurrentYearExpenditure(parseInt(totalYearlyExpenditure));
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
  
      const url = `http://localhost:5000/api/expenses?user=${user}&page=${page}&limit=${pageSize}` + 
                  `&categories=${selectedCategories.join(',')}&minAmount=${amountFilter[0]}&maxAmount=${amountFilter[1]}`;
      const response = await axios.get(url, { headers });
      const { expenses: fetchedExpenses, totalCount: fetchedTotalCount } = response.data;
      setExpenses(fetchedExpenses.map((expense, index) => ({
        id: index + 1,
        ...expense,
        date: formatDate(expense.date),
      })));
      setTotalPages(Math.ceil(fetchedTotalCount / pageSize));
    } catch (error) {
      if (error.response.status === 401) {
        navigate('/login');
      }
      console.error('Error fetching expenses:', error);
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
          toast.success("Expense updatedddddddddddddddddddddddddddddddd successfully", {
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
          setFetchex(!fetchex);
          const useremail = localStorage.getItem('useremail'); 
          if (amount + totalCurrentMonthExpenditure > monthlyBudget) {
            console.log(amount + totalCurrentMonthExpenditure - monthlyBudget);
            try {
              await emailjs.send("service_9z00s8l", "template_pbpmj49", {
                from_name: "Expense tracker",
                to_name: username,
                to_email: useremail,
                message: "You have exceeded your monthly budget limit by " + (parseInt(amount) + totalCurrentMonthExpenditure - monthlyBudget) + " rupees",
              });
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
          setFetchex(!fetchex);
          const useremail = localStorage.getItem('useremail'); 
          if (amount + totalCurrentMonthExpenditure > monthlyBudget) {
            try {
              await emailjs.send("service_9z00s8l", "template_pbpmj49", {
                from_name: "Expense tracker",
                to_name: username,
                to_email: useremail,
                message: "You have exceeded your monthly budget limit by " + (parseInt(amount) + totalCurrentMonthExpenditure - monthlyBudget) + " rupees",
              });
            } catch (error) {
              console.error('Error sending email:', error);
            }
          }
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

  return (
    <div style={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Expenses
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Total Current Month Expenditure: ₹{totalCurrentMonthExpenditure} {' ('}
        <span style={{ color: monthlyBudget - totalCurrentMonthExpenditure >= 0 ? 'green' : 'red' }}>
          ₹{monthlyBudget - totalCurrentMonthExpenditure}
        </span>
        {') '}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Total Current Year Expenditure: ₹{totalCurrentYearExpenditure} {' ('}
        <span style={{ color: yearlyBudget - totalCurrentYearExpenditure >= 0 ? 'green' : 'red' }}>
          ₹{yearlyBudget - totalCurrentYearExpenditure}
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
          max={100000}
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
        rows={expenses}
        columns={columns}
        getRowId={(row) => row._id}
        pagination
        pageSize={pageSize}
        rowCount={totalPages * pageSize}
        onPageChange={(newPage) => setPage(newPage + 1)}
        rowsPerPageOptions={[25, 50, 100]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
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
