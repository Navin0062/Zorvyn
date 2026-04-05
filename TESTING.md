# Testing Guide

This guide shows you how to test the API manually or using the provided scripts.

## Quick Start

### 1. Seed the Database

```bash
npm run seed
```

This creates sample users and financial records.

### 2. Start the Server

```bash
npm start
```

The server will start on http://localhost:3000

### 3. Test with cURL

#### Login as Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@zorvyn.com\",\"password\":\"admin123\"}"
```

Copy the `token` from the response.

#### Use the Token

Set the token as a variable (replace with actual token):

```bash
TOKEN="your-token-here"
```

#### Create a Financial Record

```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"amount\": 1500.50,
    \"type\": \"income\",
    \"category\": \"Salary\",
    \"date\": \"2026-04-05\",
    \"description\": \"Monthly salary payment\"
  }"
```

#### Get All Records

```bash
curl -X GET http://localhost:3000/api/records \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Dashboard Summary

```bash
curl -X GET http://localhost:3000/api/records/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```

#### Create a New User (Admin Only)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"email\": \"newuser@example.com\",
    \"password\": \"newpassword123\",
    \"name\": \"New User\",
    \"role\": \"analyst\"
  }"
```

## Sample Credentials

After running `npm run seed`:

| Role    | Email                | Password     |
|---------|----------------------|--------------|
| Admin   | admin@zorvyn.com     | admin123     |
| Analyst | analyst@zorvyn.com   | analyst123   |
| Viewer  | viewer@zorvyn.com    | viewer123    |

## Testing Role-Based Access

### Viewer (Read-only)

Login as viewer:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"viewer@zorvyn.com\",\"password\":\"viewer123\"}"
```

Try to create a record (should fail with 403):
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -d "{\"amount\": 100, \"type\": \"expense\", \"category\": \"Food\", \"date\": \"2026-04-05\"}"
```

### Analyst (Can read and create)

Login as analyst:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"analyst@zorvyn.com\",\"password\":\"analyst123\"}"
```

Create a record (should succeed):
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANALYST_TOKEN" \
  -d "{\"amount\": 500, \"type\": \"income\", \"category\": \"Freelance\", \"date\": \"2026-04-05\"}"
```

Try to update a record (should fail with 403):
```bash
curl -X PUT http://localhost:3000/api/records/RECORD_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANALYST_TOKEN" \
  -d "{\"amount\": 600}"
```

### Admin (Full access)

Login as admin and perform all operations.

## Running Automated Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/auth.test.js
```

## Using Postman

1. Import the API endpoints
2. Set up environment variables for tokens
3. Use the Bearer Token authorization type
4. Test all endpoints with different user roles

## Common Response Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate entry)
- **500** - Internal Server Error

## Error Response Format

```json
{
  "error": "Error message",
  "details": []  // Optional validation details
}
```

## Success Response Format

```json
{
  "message": "Success message",
  "data": {}  // or "user": {}, "record": {}, etc.
}
```
