const express = require('express');
const router = express.Router();
const FinancialRecordController = require('../controllers/FinancialRecordController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Dashboard summary
router.get('/dashboard/summary', FinancialRecordController.getDashboardSummary);

// Admin and Analyst can view all records
router.get('/', authorizeRole('admin', 'analyst'), FinancialRecordController.getAllRecords);
router.get('/:id', authorizeRole('admin', 'analyst'), FinancialRecordController.getRecordById);

// Analyst and Admin can create records
router.post('/', authorizeRole('admin', 'analyst'), FinancialRecordController.createRecord);

// Only Admin can update and delete records
router.put('/:id', authorizeRole('admin'), FinancialRecordController.updateRecord);
router.delete('/:id', authorizeRole('admin'), FinancialRecordController.deleteRecord);

module.exports = router;
