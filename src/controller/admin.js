const Admin = require('../models/Admin');
const asyncHandler = require('../middleware/asyncHandler');
const jwt = require('jsonwebtoken');

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password',
    });
  }

  // Check for admin
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  // Check if admin is active
  if (!admin.isActive) {
    return res.status(401).json({
      success: false,
      error: 'Account is deactivated. Please contact administrator',
    });
  }

  // Check password
  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  // Create token
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'mannvi_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  res.status(200).json({
    success: true,
    data: {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});

// @desc    Get current admin
// @route   GET /api/admin/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id);

  res.status(200).json({
    success: true,
    data: admin,
  });
});

// @desc    Create admin (for initial setup)
// @route   POST /api/admin/register
// @access  Public (should be protected in production)
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({
      success: false,
      error: 'Admin with this email already exists',
    });
  }

  // Create admin
  const admin = await Admin.create({
    name,
    email,
    password,
    role: role || 'Admin',
  });

  res.status(201).json({
    success: true,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

