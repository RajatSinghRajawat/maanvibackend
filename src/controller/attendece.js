const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Public
exports.getAttendance = asyncHandler(async (req, res) => {
  const { employeeId, startDate, endDate, status, month, year, page = 1, limit = 50 } = req.query;

  // Build query
  const query = {};
  if (employeeId) {
    query.employee = employeeId;
  }
  if (status) {
    query.status = status;
  }

  // Date range filter
  if (startDate || endDate || month || year) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date.$gte = start;
      query.date.$lte = end;
    }
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const attendance = await Attendance.find(query)
    .populate('employee', 'name email role')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Attendance.countDocuments(query);

  res.status(200).json({
    success: true,
    count: attendance.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: attendance,
  });
});

// @desc    Get attendance for specific employee and month
// @route   GET /api/attendance/employee/:employeeId/month
// @access  Public
exports.getEmployeeMonthAttendance = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({
      success: false,
      error: 'Month and year are required',
    });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const attendance = await Attendance.find({
    employee: employeeId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  // Calculate statistics
  const stats = {
    present: 0,
    absent: 0,
    late: 0,
    wfh: 0,
    total: new Date(year, month, 0).getDate(),
  };

  attendance.forEach((record) => {
    if (record.status === 'Present') stats.present++;
    else if (record.status === 'Absent') stats.absent++;
    else if (record.status === 'Late') stats.late++;
    else if (record.status === 'WFH') stats.wfh++;
  });

  res.status(200).json({
    success: true,
    data: attendance,
    stats,
    month: parseInt(month),
    year: parseInt(year),
  });
});

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Public
exports.getSingleAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id).populate('employee', 'name email role');

  if (!attendance) {
    return res.status(404).json({
      success: false,
      error: 'Attendance record not found',
    });
  }

  res.status(200).json({
    success: true,
    data: attendance,
  });
});

// @desc    Create or update attendance
// @route   POST /api/attendance
// @access  Public
exports.createAttendance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { employee, date, status, checkInTime, checkOutTime, location, notes } = req.body;

  // Check if employee exists
  const employeeExists = await Employee.findById(employee);
  if (!employeeExists) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found',
    });
  }

  // Check if attendance already exists for this date
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  let attendance = await Attendance.findOne({
    employee,
    date: attendanceDate,
  });

  let isNewRecord = false;

  if (attendance) {
    // Update existing record
    attendance.status = status;
    if (checkInTime) attendance.checkInTime = checkInTime;
    if (checkOutTime) attendance.checkOutTime = checkOutTime;
    if (location) attendance.location = location;
    if (notes) attendance.notes = notes;
    await attendance.save();
  } else {
    // Create new record
    isNewRecord = true;
    attendance = await Attendance.create({
      employee,
      date: attendanceDate,
      status,
      checkInTime,
      checkOutTime,
      location,
      notes,
    });
  }

  await attendance.populate('employee', 'name email role');

  res.status(201).json({
    success: true,
    data: attendance,
    message: isNewRecord ? 'Attendance created successfully' : 'Attendance updated successfully',
  });
});

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Public
exports.updateAttendance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  let attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      error: 'Attendance record not found',
    });
  }

  attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('employee', 'name email role');

  res.status(200).json({
    success: true,
    data: attendance,
  });
});

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Public
exports.deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      error: 'Attendance record not found',
    });
  }

  await attendance.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Attendance deleted successfully',
  });
});

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats/overview
// @access  Public
exports.getAttendanceStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;

  let dateQuery = {};
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    dateQuery = { date: { $gte: start, $lte: end } };
  } else if (startDate && endDate) {
    dateQuery = { date: { $gte: new Date(startDate), $lte: new Date(endDate) } };
  } else {
    // Current month by default
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    dateQuery = { date: { $gte: start, $lte: end } };
  }

  const stats = await Attendance.aggregate([
    { $match: dateQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await Attendance.countDocuments(dateQuery);
  const totalEmployees = await Employee.countDocuments({ status: 'Active' });

  const statsObj = {
    present: 0,
    absent: 0,
    late: 0,
    wfh: 0,
  };

  stats.forEach((stat) => {
    statsObj[stat._id.toLowerCase()] = stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      ...statsObj,
      total,
      totalEmployees,
      presentPercentage: totalEmployees > 0 ? ((statsObj.present / totalEmployees) * 100).toFixed(2) : 0,
    },
  });
});

