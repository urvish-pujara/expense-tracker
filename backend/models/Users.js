const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  dateOfBirth: { type: Date },
  profilePicture: { type: String },
  phoneNumber: { type: String },
  allowNotifications: { type: Boolean },
  monthlyBudget: { type: Number },
  yearlyBudget: { type: Number },
});

module.exports = mongoose.model('User', userSchema);
