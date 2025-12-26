const Enquiry = require('../models/Enquiry');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Public
exports.getEnquiries = asyncHandler(async (req, res) => {
  const { status, priority, channel, search, page = 1, limit = 10 } = req.query;

  // Build query
  const query = {};
  if (status) {
    query.status = status;
  }
  if (priority) {
    query.priority = priority;
  }
  if (channel) {
    query.channel = channel;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const enquiries = await Enquiry.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Enquiry.countDocuments(query);

  res.status(200).json({
    success: true,
    count: enquiries.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: enquiries,
  });
});

// @desc    Get single enquiry
// @route   GET /api/enquiries/:id
// @access  Public
exports.getEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      error: 'Enquiry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: enquiry,
  });
});

// @desc    Create new enquiry
// @route   POST /api/enquiries
// @access  Public
exports.createEnquiry = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const enquiry = await Enquiry.create(req.body);

  res.status(201).json({
    success: true,
    data: enquiry,
  });
});

// @desc    Update enquiry
// @route   PUT /api/enquiries/:id
// @access  Public
exports.updateEnquiry = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  let enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      error: 'Enquiry not found',
    });
  }

  // If status is being changed to Resolved or Closed, set resolvedAt
  if (req.body.status && ['Resolved', 'Closed'].includes(req.body.status) && !enquiry.resolvedAt) {
    req.body.resolvedAt = new Date();
  }

  enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: enquiry,
  });
});

// @desc    Delete enquiry
// @route   DELETE /api/enquiries/:id
// @access  Public
exports.deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      error: 'Enquiry not found',
    });
  }

  await enquiry.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Enquiry deleted successfully',
  });
});

// @desc    Get enquiry statistics
// @route   GET /api/enquiries/stats/overview
// @access  Public
exports.getEnquiryStats = asyncHandler(async (req, res) => {
  const stats = await Enquiry.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await Enquiry.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);

  const channelStats = await Enquiry.aggregate([
    {
      $group: {
        _id: '$channel',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await Enquiry.countDocuments();
  const newEnquiries = await Enquiry.countDocuments({ status: 'New' });
  const inProgress = await Enquiry.countDocuments({ status: 'In Progress' });
  const resolved = await Enquiry.countDocuments({ status: 'Resolved' });

  res.status(200).json({
    success: true,
    data: {
      total,
      new: newEnquiries,
      inProgress,
      resolved,
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      priorityBreakdown: priorityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      channelBreakdown: channelStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    },
  });
});

