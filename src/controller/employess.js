const Employee = require('../models/Employee');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Public
exports.getEmployees = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;

  // Build query
  const query = {};
  if (status) {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const employees = await Employee.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Employee.countDocuments(query);

  res.status(200).json({
    success: true,
    count: employees.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: employees,
  });
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Public
exports.getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found',
    });
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// @desc    Create new employee
// @route   POST /api/employees
// @access  Public
exports.createEmployee = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const employee = await Employee.create(req.body);

  res.status(201).json({
    success: true,
    data: employee,
  });
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Public
exports.updateEmployee = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  let employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found',
    });
  }

  employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Public
exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found',
    });
  }

  await employee.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Employee deleted successfully',
  });
});

// @desc    Get employee statistics
// @route   GET /api/employees/stats/overview
// @access  Public
exports.getEmployeeStats = asyncHandler(async (req, res) => {
  const stats = await Employee.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await Employee.countDocuments();
  const active = await Employee.countDocuments({ status: 'Active' });

  res.status(200).json({
    success: true,
    data: {
      total,
      active,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    },
  });
});

