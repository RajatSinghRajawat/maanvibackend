const { body, param, query } = require('express-validator');

// Employee validation
exports.validateEmployee = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('status').optional().isIn(['Active', 'Probation', 'Notice', 'Inactive']).withMessage('Invalid status'),
];

exports.validateEmployeeId = [
  param('id').isMongoId().withMessage('Invalid employee ID'),
];

// Attendance validation
exports.validateAttendance = [
  body('employee').isMongoId().withMessage('Valid employee ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['Present', 'Absent', 'Late', 'WFH']).withMessage('Invalid status'),
  body('checkInTime').optional().trim(),
  body('checkOutTime').optional().trim(),
  body('location').optional().trim(),
  body('notes').optional().trim(),
];

exports.validateAttendanceId = [
  param('id').isMongoId().withMessage('Invalid attendance ID'),
];

exports.validateEmployeeIdParam = [
  param('employeeId').isMongoId().withMessage('Invalid employee ID'),
];

exports.validateMonthYear = [
  query('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').isInt({ min: 2000, max: 2100 }).withMessage('Year must be valid'),
];

// Enquiry validation
exports.validateEnquiry = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('priority').optional().isIn(['High', 'Medium', 'Low']).withMessage('Invalid priority'),
  body('channel').optional().isIn(['Email', 'Call', 'WhatsApp', 'Website', 'Other']).withMessage('Invalid channel'),
  body('status').optional().isIn(['New', 'In Progress', 'Resolved', 'Closed']).withMessage('Invalid status'),
];

exports.validateEnquiryId = [
  param('id').isMongoId().withMessage('Invalid enquiry ID'),
];

