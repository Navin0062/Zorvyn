const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const UserModel = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

class AuthController {
  static async register(req, res, next) {
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

      // Generate token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      // Validation
      await body('email').isEmail().normalizeEmail().run(req);
      await body('password').notEmpty().run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({
          error: 'User account is inactive'
        });
      }

      // Verify password
      const isValidPassword = UserModel.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password_hash from response
      delete user.password_hash;

      res.json({
        message: 'Login successful',
        token,
        user
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
