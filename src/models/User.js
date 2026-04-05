const db = require('../database/connection');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

class UserModel {
  static create({ email, password, name, role = 'viewer' }) {
    const id = randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, email, passwordHash, name, role);
    
    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    
    if (user) {
      delete user.password_hash;
    }
    
    return user;
  }

  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  static findAll({ page = 1, limit = 10, search = '' } = {}) {
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, email, name, role, is_active, created_at, updated_at FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const params = [];
    const countParams = [];
    
    if (search) {
      query += ' WHERE (name LIKE ? OR email LIKE ?)';
      countQuery += ' WHERE (name LIKE ? OR email LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
      countParams.push(searchParam, searchParam);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const users = db.prepare(query).all(...params);
    const total = db.prepare(countQuery).get(...countParams).total;
    
    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static update(id, updates) {
    const allowedFields = ['name', 'role', 'is_active'];
    const updateFields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return this.findById(id);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;
