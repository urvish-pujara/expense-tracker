import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Grid, Select, MenuItem } from '@mui/material';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const formatDate = (timestamp, type) => {
    const date = new Date(timestamp);
    if (type === 'month') {
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'short' });
      return `${month} ${year}`;
    } else if (type === 'year') {
      return date.getFullYear();
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
      const expensesData = response.data.expenses.map((expense) => ({
        ...expense,
        month: formatDate(expense.date, 'month'),
        year: formatDate(expense.date, 'year'),
      }));

      setExpenses(expensesData);
      const categoryNames = [...new Set(expensesData.map((expense) => expense.category))];
      setCategoryData(categoryNames);
      setSelectedCategory(categoryNames[0]);
      const topCategories = getTopCategories(expensesData);
      setTopCategories(topCategories);
      const seasonalData = groupExpensesBySeason(expensesData);
      setSeasonalData(seasonalData);

      const monthlyData = groupByMonth(expensesData);
    const yearlyData = groupByYear(expensesData);
    const categoryData = groupByCategory(expensesData);

    // Update monthly expenses state with the correct data format
    setMonthlyExpenses(Object.values(monthlyData));

    // Update yearly expenses state with the correct data format
    setYearlyExpenses(Object.values(yearlyData));

    setCategoryExpenses(categoryData);
  } catch (error) {
    console.error('Error fetching expenses:', error);
  }
  };

  const handleChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const getCategoryChartData = () => {
    const categoryExpenses = expenses.filter((expense) => expense.category === selectedCategory);
    const groupedData = groupByMonth(categoryExpenses);
    return Object.values(groupedData);
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

  const getTopCategories = (expenses) => {
    const categoryMap = expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {});

    const sortedCategories = Object.keys(categoryMap).sort((a, b) => categoryMap[b] - categoryMap[a]);
    return sortedCategories.slice(0, 5); // Get the top 5 categories
  };

  const groupExpensesBySeason = (expenses) => {
    const seasonalExpenses = {
      Spring: 0,
      Summer: 0,
      Fall: 0,
      Winter: 0,
    };

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const month = date.getMonth() + 1;
      if (month >= 3 && month <= 5) {
        seasonalExpenses.Spring += expense.amount;
      } else if (month >= 6 && month <= 8) {
        seasonalExpenses.Summer += expense.amount;
      } else if (month >= 9 && month <= 11) {
        seasonalExpenses.Fall += expense.amount;
      } else {
        seasonalExpenses.Winter += expense.amount;
      }
    });

    return seasonalExpenses;
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Top Expense Categories
          </Typography>
          <PieChart width={500} height={300}>
            <Pie
              data={topCategories.map((category) => ({ name: category, value: categoryData.filter((cat) => cat === category).length }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {topCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </Grid>
        <Grid item xs={12}>
          <Select value={selectedCategory} onChange={handleChange}>
            {categoryData.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            {selectedCategory} Expense Trend
          </Typography>
          <LineChart width={800} height={400} data={getCategoryChartData()}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke={COLORS[Math.floor(Math.random() * COLORS.length)]}
            />
          </LineChart>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Seasonal Spending Patterns
          </Typography>
          <LineChart width={800} height={400} data={Object.entries(seasonalData)}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="0" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="1" stroke="#8884d8" />
          </LineChart>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Monthly Expenses
          </Typography>
          <LineChart width={500} height={300} data={monthlyExpenses}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Yearly Expenses
          </Typography>
          <LineChart width={500} height={300} data={yearlyExpenses}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#82ca9d" />
          </LineChart>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Category-wise Spending Breakdown
          </Typography>
          <PieChart width={600} height={300}>
            <Pie
              data={categoryExpenses}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {categoryExpenses.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </Grid>
      </Grid>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Dashboard;
