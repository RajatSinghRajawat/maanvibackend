const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} = require('../controller/employess');
const {
  validateEmployee,
  validateEmployeeId,
} = require('../middleware/validation');

// @route   GET /api/employees/stats/overview
// @desc    Get employee statistics
router.get('/stats/overview', getEmployeeStats);

// @route   GET /api/employees
// @desc    Get all employees
router.get('/', getEmployees);

// @route   GET /api/employees/:id
// @desc    Get single employee
router.get('/:id', validateEmployeeId, getEmployee);

// @route   POST /api/employees
// @desc    Create new employee
router.post('/', validateEmployee, createEmployee);

// @route   PUT /api/employees/:id
// @desc    Update employee
router.put('/:id', validateEmployeeId, validateEmployee, updateEmployee);

// @route   DELETE /api/employees/:id
// @desc    Delete employee
router.delete('/:id', validateEmployeeId, deleteEmployee);

module.exports = router;

