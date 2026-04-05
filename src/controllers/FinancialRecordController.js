const { body, validationResult } = require('express-validator');
const FinancialRecord = require('../models/FinancialRecord');

class FinancialRecordController {
  static async createRecord(req, res, next) {
    try {
      // Validation
      await body('amount').isFloat({ min: 0.01 }).run(req);
      await body('type').isIn(['income', 'expense']).run(req);
      await body('category').trim().notEmpty().run(req);
      await body('date').isISO8601().run(req);
      await body('description').optional({ nullable: true }).trim().run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { amount, type, category, date, description } = req.body;

      const record = FinancialRecord.create({
        userId: req.user.id,
        amount,
        type,
        category,
        date,
        description
      });

      res.status(201).json({
        message: 'Financial record created successfully',
        record
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllRecords(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { type, category, startDate, endDate, search } = req.query;

      // For non-admin users, only show their own records
      const userId = req.user.role === 'admin' ? undefined : req.user.id;

      const result = FinancialRecord.findAll({
        page,
        limit,
        userId,
        type,
        category,
        startDate,
        endDate,
        search
      });

      res.json({
        message: 'Financial records retrieved successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecordById(req, res, next) {
    try {
      const { id } = req.params;
      const record = FinancialRecord.findById(id);

      if (!record) {
        return res.status(404).json({
          error: 'Financial record not found'
        });
      }

      // For non-admin users, only show their own records
      if (req.user.role !== 'admin' && record.user_id !== req.user.id) {
        return res.status(403).json({
          error: 'You do not have permission to view this record'
        });
      }

      res.json({
        message: 'Financial record retrieved successfully',
        record
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRecord(req, res, next) {
    try {
      const { id } = req.params;
      const { amount, type, category, date, description } = req.body;

      // Validate if fields are provided
      if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
        return res.status(400).json({
          error: 'Amount must be a positive number'
        });
      }

      if (type !== undefined && !['income', 'expense'].includes(type)) {
        return res.status(400).json({
          error: 'Type must be either income or expense'
        });
      }

      if (date !== undefined) {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          return res.status(400).json({
            error: 'Invalid date format'
          });
        }
      }

      // Check if record exists
      const existingRecord = FinancialRecord.findById(id);
      if (!existingRecord) {
        return res.status(404).json({
          error: 'Financial record not found'
        });
      }

      // For non-admin users, only allow updating their own records
      if (req.user.role !== 'admin' && existingRecord.user_id !== req.user.id) {
        return res.status(403).json({
          error: 'You do not have permission to update this record'
        });
      }

      const updates = {};
      if (amount !== undefined) updates.amount = amount;
      if (type !== undefined) updates.type = type;
      if (category !== undefined) updates.category = category;
      if (date !== undefined) updates.date = date;
      if (description !== undefined) updates.description = description;

      const record = FinancialRecord.update(id, updates, req.user.id, req.user.role === 'admin');

      res.json({
        message: 'Financial record updated successfully',
        record
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRecord(req, res, next) {
    try {
      const { id } = req.params;

      // Check if record exists
      const existingRecord = FinancialRecord.findById(id);
      if (!existingRecord) {
        return res.status(404).json({
          error: 'Financial record not found'
        });
      }

      // For non-admin users, only allow deleting their own records
      if (req.user.role !== 'admin' && existingRecord.user_id !== req.user.id) {
        return res.status(403).json({
          error: 'You do not have permission to delete this record'
        });
      }

      const deleted = FinancialRecord.softDelete(id, req.user.id, req.user.role === 'admin');

      if (!deleted) {
        return res.status(404).json({
          error: 'Financial record not found'
        });
      }

      res.json({
        message: 'Financial record deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardSummary(req, res, next) {
    try {
      // For non-admin users, only show their own summary
      const userId = req.user.role === 'admin' ? req.user.id : req.user.id;

      const summary = FinancialRecord.getDashboardSummary(userId);

      res.json({
        message: 'Dashboard summary retrieved successfully',
        summary
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FinancialRecordController;
