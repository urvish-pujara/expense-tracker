import React, { useState, useEffect } from 'react';
import { Container, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Card, CardContent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedProfileData, setEditedProfileData] = useState({
    username: '',
    email: '',
    monthlyBudget: '',
    yearlyBudget: '',
    dateOfBirth: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('username');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/profile?user=${user}`, { headers });
        setProfileData(response.data);
        setEditedProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditIconClick = () => {
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const editedProfile = {
        username: editedProfileData.username,
        email: editedProfileData.email,
      };
      const response = await axios.put('http://localhost:5000/api/users/profile', editedProfile, { headers });
      setProfileData(editedProfileData);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfileData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4">
        User Profile
        <EditIcon onClick={handleEditIconClick} />
      </Typography>
      <CardContent>
        <Typography variant="h6">
          Username: {profileData?.username}
        </Typography>
        <Typography variant="h6">
          Email: {profileData?.email}
        </Typography>
        <Typography variant="h6">
          Monthly Budget: {profileData?.monthlyBudget}
        </Typography>
        <Typography variant="h6">
          Yearly Budget: {profileData?.yearlyBudget}
        </Typography>
        <Typography variant="h6">
          Date of Birth: {profileData?.dateOfBirth?.split('T')[0]}
        </Typography>
        <Typography variant="h6">
          Phone Number: {profileData?.phoneNumber}
        </Typography>
      </CardContent>
      <Dialog open={editDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            name="username"
            value={editedProfileData.username}
            onChange={handleInputChange}
            fullWidth
            style={{ marginTop: 20, }}
          />
          <TextField
            label="Email"
            name="email"
            value={editedProfileData.email}
            onChange={handleInputChange}
            fullWidth
            style={{ marginTop: 20, }}
          />
          <TextField
            label="Monthly Budget"
            name="monthlyBudget"
            value={editedProfileData.monthlyBudget}
            onChange={handleInputChange}
            fullWidth
            style={{ marginTop: 20, }}
          />
          <TextField
            label="Yearly Budget"
            name="yearlyBudget"
            value={editedProfileData.yearlyBudget}
            onChange={handleInputChange}
            fullWidth
            style={{ marginTop: 20, }}
          />
          <TextField
            label="Date of Birth"
            name="dateOfBirth"
            value={editedProfileData.dateOfBirth.split('T')[0]}
            onChange={handleInputChange}
            fullWidth
            style={{ marginTop: 20, }}
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={editedProfileData.phoneNumber}
            onChange={handleInputChange}
            fullWidth
            style={{ marginTop: 20, }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleProfileUpdate} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default ProfilePage;
