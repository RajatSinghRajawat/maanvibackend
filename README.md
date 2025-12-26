# Mannvi Admin Panel Backend API

Advanced RESTful API for managing Employees, Attendance, and Enquiries.

## Features

- ✅ Complete CRUD operations for Employees, Attendance, and Enquiries
- ✅ Advanced query filtering and pagination
- ✅ Data validation and error handling
- ✅ MongoDB database with Mongoose ODM
- ✅ Statistics and analytics endpoints
- ✅ Month-wise attendance tracking
- ✅ Search and filter capabilities

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mannviadmin
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system.

### 4. Run the Server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Base URL: `http://localhost:5000/api`

---

## Employees API

### Get All Employees
```
GET /api/employees
Query Parameters:
  - status: Filter by status (Active, Probation, Notice, Inactive)
  - search: Search by name, email, or role
  - page: Page number (default: 1)
  - limit: Items per page (default: 10)
```

### Get Single Employee
```
GET /api/employees/:id
```

### Create Employee
```
POST /api/employees
Body:
{
  "name": "John Doe",
  "email": "john@mannvi.com",
  "role": "Software Engineer",
  "status": "Active",
  "phone": "+1234567890",
  "department": "Engineering",
  "joiningDate": "2024-01-15"
}
```

### Update Employee
```
PUT /api/employees/:id
Body: (same as create, all fields optional)
```

### Delete Employee
```
DELETE /api/employees/:id
```

### Get Employee Statistics
```
GET /api/employees/stats/overview
```

---

## Attendance API

### Get All Attendance Records
```
GET /api/attendance
Query Parameters:
  - employeeId: Filter by employee ID
  - startDate: Start date (ISO format)
  - endDate: End date (ISO format)
  - month: Month number (1-12)
  - year: Year (e.g., 2024)
  - status: Filter by status (Present, Absent, Late, WFH)
  - page: Page number (default: 1)
  - limit: Items per page (default: 50)
```

### Get Employee Month Attendance
```
GET /api/attendance/employee/:employeeId/month?month=1&year=2024
Returns: Attendance records with statistics for the month
```

### Get Single Attendance Record
```
GET /api/attendance/:id
```

### Create/Update Attendance
```
POST /api/attendance
Body:
{
  "employee": "employee_id_here",
  "date": "2024-01-15",
  "status": "Present",
  "checkInTime": "09:00 AM",
  "checkOutTime": "06:00 PM",
  "location": "Gurgaon",
  "notes": "Optional notes"
}
Note: If attendance exists for the date, it will be updated
```

### Update Attendance
```
PUT /api/attendance/:id
Body: (same as create, all fields optional)
```

### Delete Attendance
```
DELETE /api/attendance/:id
```

### Get Attendance Statistics
```
GET /api/attendance/stats/overview
Query Parameters:
  - month: Month number (1-12)
  - year: Year
  - startDate: Start date
  - endDate: End date
```

---

## Enquiries API

### Get All Enquiries
```
GET /api/enquiries
Query Parameters:
  - status: Filter by status (New, In Progress, Resolved, Closed)
  - priority: Filter by priority (High, Medium, Low)
  - channel: Filter by channel (Email, Call, WhatsApp, Website, Other)
  - search: Search by name, email, topic, or message
  - page: Page number (default: 1)
  - limit: Items per page (default: 10)
```

### Get Single Enquiry
```
GET /api/enquiries/:id
```

### Create Enquiry
```
POST /api/enquiries
Body:
{
  "name": "Prakash S.",
  "email": "prakash@example.com",
  "phone": "+1234567890",
  "topic": "Partnership",
  "message": "Interested in partnership",
  "priority": "High",
  "channel": "Email"
}
```

### Update Enquiry
```
PUT /api/enquiries/:id
Body: (same as create, all fields optional)
Note: Setting status to "Resolved" or "Closed" automatically sets resolvedAt
```

### Delete Enquiry
```
DELETE /api/enquiries/:id
```

### Get Enquiry Statistics
```
GET /api/enquiries/stats/overview
Returns: Statistics by status, priority, and channel
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Example Usage

### Create Employee and Set Attendance

```javascript
// 1. Create Employee
const employee = await fetch('http://localhost:5000/api/employees', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Neha Verma',
    email: 'neha@mannvi.com',
    role: 'Product Manager',
    status: 'Active'
  })
});

// 2. Set Attendance
const attendance = await fetch('http://localhost:5000/api/attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    employee: employee.id,
    date: '2024-01-15',
    status: 'Present',
    checkInTime: '09:12 AM',
    location: 'Gurgaon'
  })
});

// 3. Get Month Attendance
const monthAttendance = await fetch(
  `http://localhost:5000/api/attendance/employee/${employee.id}/month?month=1&year=2024`
);
```

---

## Database Models

### Employee
- name, email, role, status
- phone, department, joiningDate, address
- timestamps

### Attendance
- employee (reference), date, status
- checkInTime, checkOutTime, location, notes
- timestamps

### Enquiry
- name, email, phone, topic, message
- priority, channel, status
- assignedTo, sla, response, resolvedAt
- timestamps

---

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- Express Validator
- CORS
- Morgan (logging)

---

## License

ISC

