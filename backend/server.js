const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://urvish:urvish@expense-tracker.zykccu8.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true }).then(
  () => {
    console.log('Connected to the database successfully');
  },
  (error) => {
    console.log(error);
    console.log('Failed to connect to the database');
    process.exit();
  }
)

const userRoutes = require('./routes/Users');
const expenseRoutes = require('./routes/Expenses');

app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
