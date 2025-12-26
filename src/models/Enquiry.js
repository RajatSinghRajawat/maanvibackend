const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    channel: {
      type: String,
      enum: ['Email', 'Call', 'WhatsApp', 'Website', 'Other'],
      default: 'Email',
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Resolved', 'Closed'],
      default: 'New',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    sla: {
      type: String,
      trim: true,
    },
    response: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
enquirySchema.index({ status: 1, priority: 1 });
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ email: 1 });

module.exports = mongoose.model('Enquiry', enquirySchema);

