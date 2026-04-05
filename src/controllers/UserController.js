const { body, validationResult } = require('express-validator');
const UserModel = require('../models/User');

class UserController {
  static async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = UserModel.findAll({ page, limit, search });

      res.json({
        message: 'Users retrieved successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = UserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        message: 'User retrieved successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req, res, next) {
    try {
      // Validation
      await body('email').isEmail().normalizeEmail().run(req);
      await body('password').isLength({ min: 6 }).run(req);
      await body('name').trim().notEmpty().run(req);
      await body('role').optional().isIn(['viewer', 'analyst', 'admin']).run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, name, role } = req.body;

      // Check if user already exists
      const existingUser = UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'User with this email already exists'
        });
      }

      // Create user
      const user = UserModel.create({
        email,
        password,
        name,
        role: role || 'viewer'
      });

      res.status(201).json({
        message: 'User created successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, role, is_active } = req.body;

      // Validate role if provided
      if (role && !['viewer', 'analyst', 'admin'].includes(role)) {
        return res.status(400).json({
          error: 'Invalid role. Must be one of: viewer, analyst, admin'
        });
      }

      // Check if user exists
      const existingUser = UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (role !== undefined) updates.role = role;
      if (is_active !== undefined) updates.is_active = is_active;

      const user = UserModel.update(id, updates);

      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Prevent self-deletion
      if (id === req.user.id) {
        return res.status(400).json({
          error: 'Cannot delete your own account'
        });
      }

      const deleted = UserModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Prevent self-deactivation
      if (id === req.user.id) {
        return res.status(400).json({
          error: 'Cannot deactivate your own account'
        });
      }

      const user = UserModel.update(id, {
        is_active: !existingUser.is_active
      });

      res.json({
        message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully`,
        user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
