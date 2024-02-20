const express = require('express');
const router = express.Router();
const UserController = require('../controllers/Users');

router.post('/register', UserController.register);
router.post('/login', UserController.login);
// router.get('/profile', UserController.profile);
// router.put('/profile', UserController.updateProfile);
// router.put('/profile/password', UserController.updatePassword);
router.put('/setBudget', UserController.setBudget);
router.get('/getBudget/:username', UserController.getBudget);


module.exports = router;
