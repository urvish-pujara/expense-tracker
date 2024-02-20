import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Grid, Select, MenuItem, TextField, Button,
    FormControl,
    InputLabel,
} from '@mui/material';
// import { LineChart, XAxis, YAxis, CartesianGrid, Line, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { init } from '@emailjs/browser';
import { LineGraph, PieGraph } from '../components';
import { Line } from 'react-chartjs-2';
init({ publicKey: 'B6kjggLZL4Ik3em9h' });
const Dashboard = () => {
    const navigate = useNavigate();
    const formatDate = (timestamp, type) => {
        const date = new Date(timestamp);
        if (type === 'month') {
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'short' });
            return `${month} ${year}`;
        } else if (type === 'year') {
            return date.getFullYear();
        } else if (type === 'date') {
            return date.toDateString().split(' ').slice(1).join(' ');
        }
    };
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6666', '#66FFB3'];
    const [expenses, setExpenses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categoryData, setCategoryData] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [seasonalData, setSeasonalData] = useState({});
    const [monthlyExpenses, setMonthlyExpenses] = useState([]);
    const [yearlyExpenses, setYearlyExpenses] = useState([]);
    const [categoryExpenses, setCategoryExpenses] = useState([]);
    const [monthlyBudget, setMonthlyBudget] = useState(0);
    const [yearlyBudget, setYearlyBudget] = useState(0);
    const [timeRange, setTimeRange] = useState('Last 30 Days');
    const [trendData, setTrendData] = useState([]);
    useEffect(() => {
        fetchExpenses();
        fetchBudget();
    }, [timeRange]);
    const fetchExpenses = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('username');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const response = await axios.get(`http://localhost:5000/api/expenses?user=${user}`, { headers });
            const expensesData = response.data.expenses.map((expense) => ({
                ...expense,
                month: formatDate(expense.date, 'month'),
                year: formatDate(expense.date, 'year'),
            }));

            setExpenses(expensesData);
            const categoryNames = [...new Set(expensesData.map((expense) => expense.category))];
            setCategoryData(categoryNames);
            setSelectedCategory(categoryNames[0]);
            const monthlyData = groupByMonth(expensesData);
            const yearlyData = groupByYear(expensesData);
            const categoryData = groupByCategory(expensesData);
            const trendData = groupByTrend(expensesData, timeRange);
            setMonthlyExpenses(Object.values(monthlyData));
            setYearlyExpenses(Object.values(yearlyData));
            setCategoryExpenses(categoryData);
            setTrendData(trendData);
        } catch (error) {
            if (error.response.status == 401) {
                navigate('/login');
            }
        }
    };

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

    const handleChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const groupByMonth = (expenses) => {
        const groupedData = expenses.reduce((acc, expense) => {
            const key = expense.month;
            if (!acc[key]) {
                acc[key] = { month: key, total: 0 };
            }
            acc[key].total += expense.amount;
            return acc;
        }, {});
        return groupedData;
    };

    const groupByYear = (expenses) => {
        const groupedData = expenses.reduce((acc, expense) => {
            const key = expense.year;
            if (!acc[key]) {
                acc[key] = { year: key, total: 0 };
            }
            acc[key].total += expense.amount;
            return acc;
        }, {});

        return groupedData;
    };

    const groupByCategory = (expenses) => {
        const groupedData = expenses.reduce((acc, expense) => {
            const key = expense.category;
            if (!acc[key]) {
                acc[key] = { category: key, total: 0 };
            }
            acc[key].total += expense.amount;
            return acc;
        }, {});

        return Object.values(groupedData);
    };

    const groupByTrend = (expenses, timeRange) => {
        let groupedData = {};
        const filteredExpenses = expenses.filter(expense => {
            const currentDate = new Date();
            const expenseDate = new Date(expense.date);
            const timeDiff = currentDate - expenseDate;
            if (timeRange === 'Last 30 Days') {
                return timeDiff <= 30 * 24 * 60 * 60 * 1000 && timeDiff >= 0;
            } else if (timeRange === 'Last 90 Days') {
                return timeDiff <= 90 * 24 * 60 * 60 * 1000 && timeDiff >= 0;
            } else if (timeRange === 'Last Year') {
                return timeDiff <= 365 * 24 * 60 * 60 * 1000 && timeDiff >= 0;
            }
            return true;
        });
        groupedData = filteredExpenses.reduce((acc, expense) => {
            const key = timeRange === 'Last Year' ? formatDate(expense.date, 'month') : formatDate(expense.date, 'date');
            if (!acc[key]) {
                acc[key] = { key };
            }
            if (!acc[key][expense.category]) {
                acc[key][expense.category] = 0;
            }
            acc[key][expense.category] += expense.amount;
            return acc;
        }, {});
        return Object.values(groupedData);
    };


    const handleMonthlyBudgetChange = (event) => {
        setMonthlyBudget(event.target.value);
    };

    const handleYearlyBudgetChange = (event) => {
        setYearlyBudget(event.target.value);
    };

    const handleTimeRangeChange = event => {
        setTimeRange(event.target.value);
    };

    const saveBudgets = async () => {
        try {
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            const requestBody = {
                username,
                monthlyBudget,
                yearlyBudget
            };
            const useremail = localStorage.getItem('useremail');
            const response = await axios.put('http://localhost:5000/api/users/setBudget', requestBody, config);

            if (response.status === 200) {
                toast.success('Budgets saved successfully', {
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
            }
            emailjs.send("service_9z00s8l", "template_pbpmj49", {
                from_name: "Expense tracker",
                to_name: username,
                to_email: useremail,
                message: "Your Budgets have been updated to the following: Monthly Budget: " + monthlyBudget + " Yearly Budget: " + yearlyBudget,
            });
        } catch (error) {
            console.error('Error saving budgets:', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={4}>
                <LineGraph data={monthlyExpenses} title="Monthly Expenses" xdatakey="month" linedatakey="total" />
                <LineGraph data={yearlyExpenses} title="Yearly Expenses" xdatakey="year" linedatakey="total" />
                <PieGraph data={categoryExpenses} title="Category-wise Spending Breakdown" datakey="total" namekey="category" />
                <LineGraph data={trendData} title="Spending Trend" xdatakey="key" linedatakey={categoryData} multipleLines >
                    <FormControl >
                        <InputLabel>Select Time Range</InputLabel>
                        <Select value={timeRange} onChange={handleTimeRangeChange}>
                            <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                            <MenuItem value="Last 90 Days">Last 90 Days</MenuItem>
                            <MenuItem value="Last Year">Last 1 Year</MenuItem>
                        </Select>
                    </FormControl>
                </LineGraph>
                <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom>
                        Set Budgets
                    </Typography>
                    <TextField
                        label="Monthly Budget"
                        type="number"
                        value={monthlyBudget}
                        onChange={handleMonthlyBudgetChange}
                        fullWidth
                        style={{ marginBottom: '20px' }}
                    />
                    <TextField
                        label="Yearly Budget"
                        type="number"
                        value={yearlyBudget}
                        onChange={handleYearlyBudgetChange}
                        fullWidth
                        style={{ marginBottom: '20px' }}
                    />
                    <Button variant="contained" color="primary" onClick={saveBudgets}>
                        Save Budgets
                    </Button>
                </Grid>
            </Grid>
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </div>
    );
};

export default Dashboard;
