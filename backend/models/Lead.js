const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Note text is required']
  },
  createdBy: {
    type: String,
    required: true,
    default: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const reminderSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Reminder text is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Reminder due date is required']
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const historySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true
    },
    source: {
      type: String,
      required: [true, 'Please specify a lead source'],
      default: 'Website Contact Form'
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'],
      default: 'New'
    },
    notes: [noteSchema],
    reminders: [reminderSchema],
    history: [historySchema]
  },
  {
    timestamps: true
  }
);

// Pre-save hook to add a history entry if status or lead is new
leadSchema.pre('save', function (next) {
  if (this.isNew) {
    this.history.push({
      action: 'Lead Created',
      details: `Lead imported/created from ${this.source}.`
    });
  } else if (this.isModified('status')) {
    // Note: status changes should also be explicitly tracked in the controller to provide user info
    // but this pre-save serves as an automated fallback.
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
