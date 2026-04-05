const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Admin only routes
router.post('/', authorizeRole('admin'), UserController.createUser);
router.put('/:id', authorizeRole('admin'), UserController.updateUser);
router.delete('/:id', authorizeRole('admin'), UserController.deleteUser);
router.patch('/:id/toggle-status', authorizeRole('admin'), UserController.toggleUserStatus);

// Routes accessible by admin and analyst
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);

module.exports = router;
