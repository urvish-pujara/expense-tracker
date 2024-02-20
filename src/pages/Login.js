import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Container, CssBaseline } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', { username, password });      
      // Display success toast
      toast.success('Login successful!', {
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
      // Save the token in local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', username);
      localStorage.setItem('useremail', response.data.email);
      // Navigate to the expenses page
      navigate('/expenses');
    } catch (error) {
      if (error?.response?.data?.error === 1) {
        // Display error toast for user not found
        toast.error('User not found. Please check your username.', {
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
      } else if (error?.response?.data?.error === 2) {
        toast.error('Invalid credentials. Please check your password.', {
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
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          noValidate
          sx={{ mt: 3 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Login
          </Button>
        </Box>
      </Box>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Container>
  );
};

export default Login;
