const db = require('./connection');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  db.exec('DELETE FROM financial_records');
  db.exec('DELETE FROM users');

  // Create users
  const users = [
    {
      id: randomUUID(),
      email: 'admin@zorvyn.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    },
    {
      id: randomUUID(),
      email: 'analyst@zorvyn.com',
      password: 'analyst123',
      name: 'Analyst User',
      role: 'analyst'
    },
    {
      id: randomUUID(),
      email: 'viewer@zorvyn.com',
      password: 'viewer123',
      name: 'Viewer User',
      role: 'viewer'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  const userIds = {};

  const insertManyUsers = db.transaction((users) => {
    for (const user of users) {
      const passwordHash = bcrypt.hashSync(user.password, 10);
      insertUser.run(user.id, user.email, passwordHash, user.name, user.role);
      userIds[user.role] = user.id;
      console.log(`✓ Created ${user.role} user: ${user.email}`);
    }
  });

  insertManyUsers(users);

  // Create financial records
  const categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Business', 'Other'],
    expense: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Rent', 'Other']
  };

  const records = [];
  const now = new Date();

  // Generate records for last 6 months
  for (let i = 0; i < 50; i++) {
    const type = Math.random() > 0.4 ? 'income' : 'expense';
    const category = categories[type][Math.floor(Math.random() * categories[type].length)];
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    records.push({
      id: randomUUID(),
      userId: userIds.analyst,
      amount: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      type,
      category,
      date: date.toISOString().split('T')[0],
      description: `Sample ${type} record for ${category}`
    });
  }

  const insertRecord = db.prepare(`
    INSERT INTO financial_records (id, user_id, amount, type, category, date, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertManyRecords = db.transaction((records) => {
    for (const record of records) {
      insertRecord.run(
        record.id,
        record.userId,
        record.amount,
        record.type,
        record.category,
        record.date,
        record.description
      );
    }
    console.log(`✓ Created ${records.length} financial records`);
  });

  insertManyRecords(records);

  console.log('✅ Database seeding completed!');
  console.log('\n📝 Sample Credentials:');
  console.log('   Admin:    admin@zorvyn.com / admin123');
  console.log('   Analyst:  analyst@zorvyn.com / analyst123');
  console.log('   Viewer:   viewer@zorvyn.com / viewer123');
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
  process.exit(0);
}

module.exports = { seedDatabase };
