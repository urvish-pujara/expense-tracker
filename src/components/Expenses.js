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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const ExpensePage = () => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate =  `${year}-${month}-${day}`;
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
  useEffect(() => {
    fetchExpenses();
  }, []);
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
        if(error.response.status==401){
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
    <div style={{ height: 400, width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Expenses
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
      <DataGrid
        rows={expenses}
        columns={columns}
        getRowId={(row) => row._id} // Assuming _id is the unique identifier in your data
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
