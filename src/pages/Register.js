import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  CssBaseline,
  Avatar,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(false);

  const handleRegister = async () => {
    if (!agreeToTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy", {
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
      return;
    }
    try {
      const data = {
        username: username,
        email: email,
        password: password,
        fullName: fullName,
        dateOfBirth: dateOfBirth,
        profilePicture: profilePicture,
        phoneNumber: phoneNumber,
        allowNotifications: allowNotifications,
      };
      const response = await axios.post('http://localhost:5000/api/users/register', data);
      if (response.status === 201) {
        toast.success("User registered successfully", {
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
        navigate('/login');
      }
    }
    catch (error) {
      if(error){
        toast.error("Error registering user", {
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
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            id="fullName"
            label="Full Name"
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            id="dateOfBirth"
            label="Date of Birth"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            id="profilePicture"
            label="Profile Picture URL"
            name="profilePicture"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            id="phoneNumber"
            label="Phone Number"
            name="phoneNumber"
            autoComplete="tel"
            type="tel"
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                value={agreeToTerms}
                onChange={() => setAgreeToTerms(!agreeToTerms)}
                color="primary"
              />
            }
            label="I agree to the Terms of Service and Privacy Policy"
          />

          <FormControlLabel
            control={
              <Checkbox
                value={allowNotifications}
                onChange={() => setAllowNotifications(!allowNotifications)}
                color="primary"
              />
            }
            label="Allow notifications and emails"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Register
          </Button>
        </Box>
      </Box>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Container>
  );
};

export default Register;
