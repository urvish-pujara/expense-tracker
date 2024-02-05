import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import backgroundImage from './assets/j.jpg'; // Replace with the correct path to your image
import Expenses from './components/Expenses';
import Dashboard from './components/Dashboard';
function App() {

  const appStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh', // Ensure the background covers the entire viewport
    backgroundAttachment: 'fixed', // Fixed background
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <Router>
      {/* add background image */}
      <div style={appStyle}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/" element={<Dashboard />} />
        {/* Add more routes for your Expense Tracker app */}
      </Routes>
      </div>
    </Router>
  );
}

export default App;
