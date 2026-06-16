const Lead = require('../models/Lead');

// @desc    Get all leads with filtering, search, and pagination
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    const { status, source, search, sort } = req.query;
    let query = {};

    // Filter by Status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by Source
    if (source && source !== 'All') {
      query.source = source;
    }

    // Search query (name, email, phone)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortBy = { createdAt: -1 }; // Default
    if (sort) {
      if (sort === 'oldest') {
        sortBy = { createdAt: 1 };
      } else if (sort === 'name_asc') {
        sortBy = { name: 1 };
      } else if (sort === 'name_desc') {
        sortBy = { name: -1 };
      }
    }

    const leads = await Lead.find(query).sort(sortBy);

    return res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get a single lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.id || req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    return res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new lead (Admin manually)
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
  try {
    const { name, email, phone, source, status, notes } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least Name, Email, and Phone Number'
      });
    }

    const initialNotes = [];
    if (notes) {
      initialNotes.push({
        text: notes,
        createdBy: req.user ? req.user.username : 'Admin'
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      source: source || 'Manual Entry',
      status: status || 'New',
      notes: initialNotes
    });

    return res.status(201).json({
      success: true,
      data: lead
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Submit a lead from public website form
// @route   POST /api/leads/public
// @access  Public
const submitPublicLead = async (req, res) => {
  try {
    const { name, email, phone, source, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide Name, Email, and Phone Number'
      });
    }

    const initialNotes = [];
    if (message) {
      initialNotes.push({
        text: `Initial Contact Message: "${message}"`,
        createdBy: 'Website Contact Form'
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      source: source || 'Website Contact Form',
      status: 'New',
      notes: initialNotes
    });

    return res.status(201).json({
      success: true,
      message: 'Lead submitted successfully',
      data: { id: lead._id }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a lead details / status
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
  try {
    const { name, email, phone, source, status } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    let statusChanged = false;
    let oldStatus = lead.status;

    if (status && status !== lead.status) {
      statusChanged = true;
      lead.status = status;
      lead.history.push({
        action: 'Status Changed',
        details: `Status updated from ${oldStatus} to ${status}.`
      });
    }

    if (name) lead.name = name;
    if (email) lead.email = email;
    if (phone) lead.phone = phone;
    if (source) lead.source = source;

    if (name || email || phone || source) {
      if (!statusChanged) {
        lead.history.push({
          action: 'Lead Updated',
          details: 'Basic lead details updated.'
        });
      }
    }

    await lead.save();

    return res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add a note to a lead
// @route   POST /api/leads/:id/notes
// @access  Private
const addNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Please provide note text' });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const createdBy = req.user ? req.user.username : 'Admin';
    
    lead.notes.push({ text, createdBy });
    lead.history.push({
      action: 'Note Added',
      details: `New note added by ${createdBy}.`
    });

    await lead.save();

    return res.status(200).json({
      success: true,
      data: lead.notes[lead.notes.length - 1],
      lead
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add a reminder to a lead
// @route   POST /api/leads/:id/reminders
// @access  Private
const addReminder = async (req, res) => {
  try {
    const { text, dueDate } = req.body;

    if (!text || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide reminder text and due date'
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    lead.reminders.push({ text, dueDate });
    lead.history.push({
      action: 'Reminder Scheduled',
      details: `Reminder set: "${text}" due on ${new Date(dueDate).toLocaleDateString()}.`
    });

    await lead.save();

    return res.status(200).json({
      success: true,
      data: lead.reminders[lead.reminders.length - 1],
      lead
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle reminder completion
// @route   PUT /api/leads/:id/reminders/:reminderId
// @access  Private
const toggleReminder = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const reminder = lead.reminders.id(req.params.reminderId);

    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    reminder.completed = !reminder.completed;
    
    lead.history.push({
      action: 'Reminder Updated',
      details: `Reminder "${reminder.text}" marked as ${reminder.completed ? 'completed' : 'pending'}.`
    });

    await lead.save();

    return res.status(200).json({
      success: true,
      data: reminder,
      lead
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get dashboard analytics / statistics
// @route   GET /api/leads/stats
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const convertedLeads = await Lead.countDocuments({ status: 'Converted' });
    
    // Calculation: (Converted / Total) * 100
    const conversionRate = totalLeads > 0 
      ? Math.round((convertedLeads / totalLeads) * 100) 
      : 0;

    // Leads by Status aggregation
    const statusCounts = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format status for UI
    const allStatuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
    const statusBreakdown = allStatuses.map(status => {
      const found = statusCounts.find(s => s._id === status);
      return {
        name: status,
        value: found ? found.count : 0
      };
    });

    // Leads by Source aggregation
    const sourceCounts = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    const sourceBreakdown = sourceCounts.map(s => ({
      name: s._id || 'Unknown',
      value: s.count
    }));

    // Lead volumes over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trend = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in dates that might have 0 leads in the trend for consistent display
    const trendBreakdown = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = trend.find(t => t._id === dateStr);
      trendBreakdown.push({
        date: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count: found ? found.count : 0
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalLeads,
          newLeads,
          convertedLeads,
          conversionRate
        },
        statusBreakdown,
        sourceBreakdown,
        trendBreakdown
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  submitPublicLead,
  updateLead,
  deleteLead,
  addNote,
  addReminder,
  toggleReminder,
  getAnalytics
};
