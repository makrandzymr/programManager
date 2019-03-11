var express = require('express');
var router = express.Router();

const userController = require('../controllers/user.controller');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/dashboard', userController.getDashboard)

module.exports = router;
