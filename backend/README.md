# Document Management Backend

This is the backend API for the Document Management System.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/document_management
NODE_ENV=development
```

3. Make sure MongoDB is running on your system.

4. Seed the database with initial users:
```bash
npm run seed
```

5. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Default Users

After running the seed script, the following users will be available:
- **admin/admin** (Admin role)
- **staff/staff** (Staff role)  
- **viewer/viewer** (Viewer role)

## API Endpoints

### Authentication
- `POST /api/login` - User login (returns user info with role)

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/login` - Alternative login endpoint

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document (Admin only)

### Audit Logs
- `GET /api/audit-logs` - Get all audit logs
- `POST /api/audit-logs` - Create audit log entry
- `GET /api/audit-logs/:id` - Get audit log by ID
- `DELETE /api/audit-logs/:id` - Delete audit log

### Dashboard
- `GET /api/dashboard-stats` - Get dashboard statistics

## Database Models

### User
- username (required, unique)
- password (required, hashed)
- role (required: Admin, Staff, Viewer)

### Document
- title (required)
- category (required)
- description
- uploadedBy (required)
- uploadedAt (default: current date)
- file
- status (default: 'active')
- logs (array of strings)
- versions (array of version objects)

### AuditLog
- action (required)
- user (required)
- timestamp (default: current date)
- doc (required)
- status

## Response Format

All API responses follow this format:
```json
{
  "success": true/false,
  "data": {...} // or "error": "error message"
}
```

## Features

- **User Authentication**: Secure login with bcrypt password hashing
- **Role-based Access**: Admin, Staff, and Viewer roles with different permissions
- **Document Management**: CRUD operations for documents with version tracking
- **Audit Logging**: Automatic logging of all document operations
- **Dashboard Statistics**: Real-time statistics for the dashboard
- **Error Handling**: Comprehensive error handling with consistent responses
- **MongoDB Integration**: Full MongoDB integration with Mongoose ODM

## Security Features

- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control
- Audit logging for all operations
- Error handling without exposing sensitive information 