const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoint for website contact forms
router.post('/public', submitPublicLead);

// Protected endpoints for administrators
router.route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router.get('/stats', protect, getAnalytics);

router.route('/:id')
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, deleteLead);

router.post('/:id/notes', protect, addNote);
router.post('/:id/reminders', protect, addReminder);
router.put('/:id/reminders/:reminderId', protect, toggleReminder);

module.exports = router;
