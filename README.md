# Finance Data Processing and Access Control Backend

A robust backend system for managing financial records, user roles, and permissions. Built with Node.js, Express, and SQLite, this project demonstrates clean API design, role-based access control, and proper data handling.

## 🎯 Objective

This system provides:
- **User & Role Management** - Create, update, and manage users with role-based permissions
- **Financial Records Management** - CRUD operations for financial transactions
- **Dashboard Analytics** - Aggregated summaries and insights
- **Access Control** - Role-based authorization (Viewer, Analyst, Admin)
- **Data Persistence** - SQLite database with proper schema design

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (via better-sqlite3)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, bcrypt
- **Testing**: Jest, Supertest

### Project Structure

```
Zorvyn/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── AuthController.js
│   │   ├── UserController.js
│   │   └── FinancialRecordController.js
│   ├── middleware/        # Express middleware
│   │   ├── auth.js       # Authentication & authorization
│   │   └── errorHandler.js
│   ├── models/           # Data models
│   │   ├── User.js
│   │   └── FinancialRecord.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── records.js
│   ├── database/         # Database configuration
│   │   ├── connection.js
│   │   ├── schema.sql
│   │   └── seed.js
│   └── app.js           # Express app setup
├── data/                # SQLite database files (auto-created)
├── tests/               # Test files
├── index.js             # Entry point
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd Zorvyn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Seed the database with sample data**
   ```bash
   npm run seed
   ```

4. **Start the server**
   ```bash
   # Production
   npm start

   # Development (with auto-reload)
   npm run dev
   ```

5. **Access the API**
   - Server runs on: `http://localhost:3000`
   - Health check: `http://localhost:3000/health`
   - API Base URL: `http://localhost:3000/api`
   - **API Documentation**: `http://localhost:3000/api/docs` ⭐

## 🔐 Sample Credentials

After seeding the database:

| Role    | Email                | Password     |
|---------|----------------------|--------------|
| Admin   | admin@zorvyn.com     | admin123     |
| Analyst | analyst@zorvyn.com   | analyst123   |
| Viewer  | viewer@zorvyn.com    | viewer123    |

## 📡 API Documentation

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "viewer"  // optional, defaults to "viewer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@zorvyn.com",
  "password": "admin123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@zorvyn.com",
    "name": "Admin User",
    "role": "admin",
    "is_active": true
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### User Management (Admin Only)

#### Get All Users
```http
GET /api/users?page=1&limit=10&search=admin
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepass123",
  "name": "New User",
  "role": "analyst"
}
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "admin",
  "is_active": true
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

#### Toggle User Status
```http
PATCH /api/users/:id/toggle-status
Authorization: Bearer <token>
```

### Financial Records

#### Get All Records
```http
GET /api/records?page=1&limit=10&type=expense&category=Food&startDate=2025-01-01&endDate=2025-12-31&search=Salary
Authorization: Bearer <token>
```

**Note**: 
- **Admin/Analyst**: Can view all records
- **Viewer**: Can only view their own records

#### Get Record by ID
```http
GET /api/records/:id
Authorization: Bearer <token>
```

#### Create Record
```http
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500.50,
  "type": "income",        // "income" or "expense"
  "category": "Salary",
  "date": "2026-04-05",
  "description": "Monthly salary payment"
}
```

**Permissions**: Admin and Analyst can create records

#### Update Record
```http
PUT /api/records/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 2000.00,
  "description": "Updated description"
}
```

**Permissions**: Admin only

#### Delete Record (Soft Delete)
```http
DELETE /api/records/:id
Authorization: Bearer <token>
```

**Permissions**: Admin only

### Dashboard & Analytics

#### Get Dashboard Summary
```http
GET /api/records/dashboard/summary
Authorization: Bearer <token>

Response:
{
  "message": "Dashboard summary retrieved successfully",
  "summary": {
    "totalIncome": 25000.00,
    "totalExpenses": 12000.00,
    "netBalance": 13000.00,
    "categoryBreakdown": [
      {
        "category": "Salary",
        "type": "income",
        "total": 20000.00,
        "count": 5
      }
    ],
    "recentActivity": [
      {
        "id": "...",
        "amount": 1500.00,
        "type": "income",
        "category": "Salary",
        "date": "2026-04-01",
        "description": "Monthly salary",
        "created_at": "2026-04-01T10:00:00Z"
      }
    ],
    "monthlyTrends": [
      {
        "month": "2026-04",
        "type": "income",
        "total": 5000.00
      }
    ]
  }
}
```

## 🔒 Role-Based Access Control

### Roles and Permissions

| Action                    | Viewer | Analyst | Admin |
|---------------------------|--------|---------|-------|
| View own records          | ✅     | ✅      | ✅    |
| View all records          | ❌     | ✅      | ✅    |
| Create records            | ❌     | ✅      | ✅    |
| Update records            | ❌     | ❌      | ✅    |
| Delete records            | ❌     | ❌      | ✅    |
| View dashboard summary    | ✅     | ✅      | ✅    |
| Manage users              | ❌     | ❌      | ✅    |
| View users list           | ❌     | ✅      | ✅    |

### Implementation Details

The access control is implemented using Express middleware:

1. **`authenticateToken`** - Validates JWT and attaches user to request
2. **`authorizeRole(...roles)`** - Checks if user has required role
3. **Data-level permissions** - Non-admin users can only access their own data

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Financial Records Table
```sql
CREATE TABLE financial_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## ✅ Validation & Error Handling

### Input Validation
- Email format and normalization
- Password minimum length (6 characters)
- Amount must be positive
- Type must be 'income' or 'expense'
- Date must be valid ISO8601 format
- Role must be one of: viewer, analyst, admin

### Rate Limiting
To prevent abuse, the API implements rate limiting:
- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 20 requests per 15 minutes per IP
- **Record mutations**: 50 requests per 15 minutes per IP

When rate limit is exceeded, the API returns:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

### Error Responses
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate entries)
- **500** - Internal Server Error

### Example Error Response
```json
{
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "value": "",
      "msg": "Invalid value",
      "path": "email",
      "location": "body"
    }
  ]
}
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Assumptions & Design Decisions

1. **SQLite Choice**: Used SQLite for simplicity and portability. Easy to set up without requiring external database servers.

2. **Soft Deletes**: Financial records use soft deletes (`is_deleted` flag) to preserve data history and enable audit trails.

3. **JWT Authentication**: Statelesss authentication suitable for REST APIs. Tokens expire after 24 hours.

4. **Role Hierarchy**: Simple flat role system rather than hierarchical permissions for clarity and maintainability.

5. **Data Isolation**: Non-admin users can only see and modify their own financial records.

6. **Pagination**: All list endpoints support pagination to handle large datasets efficiently.

7. **Password Hashing**: Using bcrypt with salt rounds for secure password storage.

8. **Synchronous Database Operations**: Using better-sqlite3's synchronous API for simplicity. In production with high concurrency, consider async operations.

## 🔧 Environment Variables

Optional configuration:

```env
PORT=3000                    # Server port
JWT_SECRET=your-secret-key   # JWT signing secret
```

## 🚧 Potential Enhancements

- [ ] Refresh token mechanism
- [ ] Password reset functionality
- [ ] Email verification
- [x] **Rate limiting** ✅ - Implemented with tiered limits
- [ ] API versioning
- [ ] Export data to CSV/Excel
- [ ] Advanced filtering and search
- [ ] Real-time updates with WebSockets
- [ ] File attachments for records
- [ ] Multi-currency support
- [ ] Budget tracking
- [ ] Recurring transactions

## 📊 API Testing Examples

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zorvyn.com","password":"admin123"}'

# Create record
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 500.00,
    "type": "expense",
    "category": "Food",
    "date": "2026-04-05",
    "description": "Grocery shopping"
  }'

# Get dashboard
curl -X GET http://localhost:3000/api/records/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 👨‍💻 Development

```bash
# Install dependencies
npm install

# Seed database
npm run seed

# Start development server
npm run dev

# Run tests
npm test
```

## 📄 License

ISC

## 🤝 Author

Built as part of the Zorvyn Finance Backend Assignment

---

**Note**: This is a demonstration project for assessment purposes. While it follows best practices, it's not intended for production use without additional security measures, monitoring, and infrastructure hardening.
