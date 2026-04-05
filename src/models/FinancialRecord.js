const db = require('../database/connection');
const { randomUUID } = require('crypto');

class FinancialRecord {
  static create({ userId, amount, type, category, date, description }) {
    const id = randomUUID();
    
    const stmt = db.prepare(`
      INSERT INTO financial_records (id, user_id, amount, type, category, date, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, userId, amount, type, category, date, description);
    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT 
        r.*,
        u.name as created_by_name,
        u.email as created_by_email
      FROM financial_records r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ? AND r.is_deleted = 0
    `);
    
    return stmt.get(id);
  }

  static findAll({ 
    page = 1, 
    limit = 10, 
    userId,
    type, 
    category, 
    startDate, 
    endDate,
    search = ''
  } = {}) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        r.*,
        u.name as created_by_name,
        u.email as created_by_email
      FROM financial_records r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.is_deleted = 0
    `;
    
    let countQuery = 'SELECT COUNT(*) as total FROM financial_records WHERE is_deleted = 0';
    const params = [];
    const countParams = [];
    
    if (userId) {
      query += ' AND r.user_id = ?';
      countQuery += ' AND user_id = ?';
      params.push(userId);
      countParams.push(userId);
    }
    
    if (type) {
      query += ' AND r.type = ?';
      countQuery += ' AND type = ?';
      params.push(type);
      countParams.push(type);
    }
    
    if (category) {
      query += ' AND r.category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }
    
    if (startDate) {
      query += ' AND r.date >= ?';
      countQuery += ' AND date >= ?';
      params.push(startDate);
      countParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.date <= ?';
      countQuery += ' AND date <= ?';
      params.push(endDate);
      countParams.push(endDate);
    }
    
    if (search) {
      query += ' AND (r.description LIKE ? OR r.category LIKE ?)';
      countQuery += ' AND (description LIKE ? OR category LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
      countParams.push(searchParam, searchParam);
    }
    
    query += ' ORDER BY r.date DESC, r.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const records = db.prepare(query).all(...params);
    const total = db.prepare(countQuery).get(...countParams).total;
    
    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static update(id, updates, userId, isAdmin = false) {
    const allowedFields = ['amount', 'type', 'category', 'date', 'description'];
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
    
    // Admin can update any record, others can only update their own
    if (isAdmin) {
      values.push(id);
    } else {
      values.push(id, userId);
    }

    const stmt = db.prepare(`
      UPDATE financial_records 
      SET ${updateFields.join(', ')}
      WHERE id = ? ${isAdmin ? '' : 'AND user_id = ?'} AND is_deleted = 0
    `);
    
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      throw new Error('Record not found or you do not have permission to update it');
    }
    
    return this.findById(id);
  }

  static softDelete(id, userId, isAdmin = false) {
    // Admin can delete any record, others can only delete their own
    const whereClause = isAdmin ? 'WHERE id = ? AND is_deleted = 0' : 'WHERE id = ? AND user_id = ? AND is_deleted = 0';
    const params = isAdmin ? [id] : [id, userId];
    
    const stmt = db.prepare(`
      UPDATE financial_records 
      SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP
      ${whereClause}
    `);
    
    const result = stmt.run(...params);
    return result.changes > 0;
  }

  static getDashboardSummary(userId) {
    // Total income
    const totalIncomeStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM financial_records
      WHERE user_id = ? AND type = 'income' AND is_deleted = 0
    `);
    const totalIncome = totalIncomeStmt.get(userId).total;
    
    // Total expenses
    const totalExpensesStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM financial_records
      WHERE user_id = ? AND type = 'expense' AND is_deleted = 0
    `);
    const totalExpenses = totalExpensesStmt.get(userId).total;
    
    // Category-wise breakdown
    const categoryBreakdownStmt = db.prepare(`
      SELECT 
        category,
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM financial_records
      WHERE user_id = ? AND is_deleted = 0
      GROUP BY category, type
      ORDER BY total DESC
    `);
    const categoryBreakdown = categoryBreakdownStmt.all(userId);
    
    // Recent activity (last 10 records)
    const recentActivityStmt = db.prepare(`
      SELECT 
        r.id,
        r.amount,
        r.type,
        r.category,
        r.date,
        r.description,
        r.created_at
      FROM financial_records r
      WHERE r.user_id = ? AND r.is_deleted = 0
      ORDER BY r.created_at DESC
      LIMIT 10
    `);
    const recentActivity = recentActivityStmt.all(userId);
    
    // Monthly trends (last 6 months)
    const monthlyTrendsStmt = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        type,
        SUM(amount) as total
      FROM financial_records
      WHERE user_id = ? AND is_deleted = 0
        AND date >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', date), type
      ORDER BY month DESC
    `);
    const monthlyTrends = monthlyTrendsStmt.all(userId);
    
    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryBreakdown,
      recentActivity,
      monthlyTrends
    };
  }
}

module.exports = FinancialRecord;
