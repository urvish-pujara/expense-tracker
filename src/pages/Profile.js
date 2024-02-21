import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { Card, CardContent } from '@mui/material';
import axios from 'axios';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('username');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${user}`, { headers });
        setProfileData(response.data);
        console.log(response.data); // check the response in the console
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
    </Container>
  );
};

export default ProfilePage;
