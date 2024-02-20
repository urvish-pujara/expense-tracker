const User = require('../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      dateOfBirth,
      profilePicture,
      phoneNumber,
      allowNotifications,
    } = req.body;
    // validation
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new User instance
    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      dateOfBirth,
      profilePicture,
      phoneNumber,
      allowNotifications,
    });
    // Save the user to the database
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 1 });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 2 });
    }
    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const email = user.email;
    res.status(200).json({ token, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setBudget = async (req, res) => {
  try {
    const { username } = req.body;
    const { monthlyBudget, yearlyBudget } = req.body;
    await User.findOneAndUpdate({ username }, { monthlyBudget, yearlyBudget });
    res.status(200).json({ message: 'Budget updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBudget = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { monthlyBudget, yearlyBudget } = user;
    res.status(200).json({ monthlyBudget, yearlyBudget });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { register, login, setBudget, getBudget };
