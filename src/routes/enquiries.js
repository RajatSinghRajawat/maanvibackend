const express = require('express');
const router = express.Router();
const {
  getEnquiries,
  getEnquiry,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiryStats,
} = require('../controller/inuiery');
const {
  validateEnquiry,
  validateEnquiryId,
} = require('../middleware/validation');

// @route   GET /api/enquiries/stats/overview
// @desc    Get enquiry statistics
router.get('/stats/overview', getEnquiryStats);

// @route   GET /api/enquiries
// @desc    Get all enquiries
router.get('/', getEnquiries);

// @route   GET /api/enquiries/:id
// @desc    Get single enquiry
router.get('/:id', validateEnquiryId, getEnquiry);

// @route   POST /api/enquiries
// @desc    Create new enquiry
router.post('/', validateEnquiry, createEnquiry);

// @route   PUT /api/enquiries/:id
// @desc    Update enquiry
router.put('/:id', validateEnquiryId, validateEnquiry, updateEnquiry);

// @route   DELETE /api/enquiries/:id
// @desc    Delete enquiry
router.delete('/:id', validateEnquiryId, deleteEnquiry);

module.exports = router;

