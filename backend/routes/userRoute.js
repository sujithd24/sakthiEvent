const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// LOGIN
router.post('/login', userController.login);

// CREATE
router.post('/', userController.createUser);

// READ
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// UPDATE
router.put('/:id', userController.updateUser);

// DELETE
router.delete('/:id', userController.deleteUser);

module.exports = router;
