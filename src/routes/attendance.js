const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getEmployeeMonthAttendance,
  getSingleAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
} = require('../controller/attendece');
const {
  validateAttendance,
  validateAttendanceId,
  validateEmployeeIdParam,
  validateMonthYear,
} = require('../middleware/validation');

// @route   GET /api/attendance/stats/overview
// @desc    Get attendance statistics
router.get('/stats/overview', getAttendanceStats);

// @route   GET /api/attendance/employee/:employeeId/month
// @desc    Get employee attendance for specific month
router.get('/employee/:employeeId/month', validateEmployeeIdParam, validateMonthYear, getEmployeeMonthAttendance);

// @route   GET /api/attendance
// @desc    Get all attendance records
router.get('/', getAttendance);

// @route   GET /api/attendance/:id
// @desc    Get single attendance record
router.get('/:id', validateAttendanceId, getSingleAttendance);

// @route   POST /api/attendance
// @desc    Create or update attendance
router.post('/', validateAttendance, createAttendance);

// @route   PUT /api/attendance/:id
// @desc    Update attendance
router.put('/:id', validateAttendanceId, validateAttendance, updateAttendance);

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance
router.delete('/:id', validateAttendanceId, deleteAttendance);

module.exports = router;

