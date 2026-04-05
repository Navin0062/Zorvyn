# Zorvyn Finance Backend - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
```bash
npm run seed
```

This creates:
- 3 sample users (admin, analyst, viewer)
- 50 sample financial records

### Step 3: Start Server
```bash
npm start
```

Server runs on: **http://localhost:3000**

**📚 Interactive API Documentation**: **http://localhost:3000/api/docs**

---

## 🔑 Sample Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@zorvyn.com | admin123 |
| **Analyst** | analyst@zorvyn.com | analyst123 |
| **Viewer** | viewer@zorvyn.com | viewer123 |

---

## 🧪 Test the API

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zorvyn.com","password":"admin123"}'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@zorvyn.com",
    "name": "Admin User",
    "role": "admin",
    "is_active": true
  }
}
```

### 2. Use the Token
Copy the `token` value and use it for all API requests:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 3. Get Dashboard Summary
```bash
curl -X GET http://localhost:3000/api/records/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Create a Record
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 1500.50,
    "type": "income",
    "category": "Salary",
    "date": "2026-04-05",
    "description": "Monthly salary"
  }'
```

### 5. Get All Records
```bash
curl -X GET http://localhost:3000/api/records \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎭 Test Role-Based Access

### As Viewer (Read-only)
```bash
# Login as viewer
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@zorvyn.com","password":"viewer123"}'

# Try to create (will fail with 403)
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -d '{"amount": 100, "type": "expense", "category": "Food", "date": "2026-04-05"}'
```

### As Analyst (Read + Create)
```bash
# Login as analyst
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@zorvyn.com","password":"analyst123"}'

# Create record (will succeed)
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANALYST_TOKEN" \
  -d '{"amount": 500, "type": "income", "category": "Freelance", "date": "2026-04-05"}'
```

---

## 📊 Available Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Users (Admin Only for mutations)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Financial Records
- `GET /api/records` - List records
- `POST /api/records` - Create (Analyst+)
- `PUT /api/records/:id` - Update (Admin only)
- `DELETE /api/records/:id` - Delete (Admin only)
- `GET /api/records/dashboard/summary` - Dashboard

---

## 🧪 Run Tests

```bash
npm test
```

**Expected output:**
```
PASS tests/api.test.js
  11 passing tests
```

---

## 📖 Full Documentation

- **README.md** - Complete documentation
- **TESTING.md** - Detailed testing guide
- **SUMMARY.md** - Project overview

---

## 🆘 Troubleshooting

### Port already in use
Edit `index.js` and change the port number from 3000 to something else.

### Database issues
Delete the `data/` folder and run `npm run seed` again.

### Dependency issues
Delete `node_modules/` and `package-lock.json`, then run `npm install`.

---

## 🎯 What You're Evaluating

✅ **API Design** - RESTful endpoints  
✅ **Access Control** - Role-based permissions  
✅ **Data Handling** - Validation and error handling  
✅ **Rate Limiting** - API abuse protection  
✅ **Code Structure** - MVC architecture  
✅ **Testing** - Integration tests included  
✅ **Documentation** - Comprehensive guides  

---

**Ready to evaluate!** 🚀
