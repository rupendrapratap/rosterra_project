const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  instagramurl: {
    type: String,
    required: false,
    trim: true
  },
  youtubeurl: {
    type: String,
    required: false,
    trim: true
  },
  followers: {
    type: String,
    required: false,
    default: '0'
  },
  averageView: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  er: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
    default: 0
  },
  language: {
    type: [String],
    required: false,
    default: []
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  contactno: {
    type: String,
    required: false,
    trim: true
  },
  commercial: {
    type: String,
    required: false,
    trim: true
  },
  // Legacy fields for backward compatibility
  age: {
    type: Number,
    required: false,
    min: 0,
    max: 150
  },
  contentType: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  talentManagerName: {
    type: String,
    required: false,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  category: {
    type: [String],
    required: false,
    default: []
  },
  platform: {
    type: [String],
    required: false,
    default: []
  }
});

// Update updatedAt before saving
dataSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Data', dataSchema);


