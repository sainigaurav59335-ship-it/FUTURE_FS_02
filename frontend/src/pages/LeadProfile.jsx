import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  FileText,
  User,
  History,
  Plus,
  AlertCircle,
  Check
} from 'lucide-react';

const LeadProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Component State
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Reminder form state
  const [reminderText, setReminderText] = useState('');
  const [reminderDueDate, setReminderDueDate] = useState('');
  const [addingReminder, setAddingReminder] = useState(false);

  // Edit fields state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', source: '' });
  const [editErrors, setEditErrors] = useState({});

  // Toast notifications state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch single lead details
  const fetchLeadDetails = async () => {
    try {
      const res = await api.getLeadById(id);
      if (res.success) {
        setLead(res.data);
        setEditForm({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          source: res.data.source
        });
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  // Handle status update change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const res = await api.updateLead(id, { status: newStatus });
      if (res.success) {
        setLead(res.data);
        showToast(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Handle Note Submission
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setAddingNote(true);
    try {
      const res = await api.addNote(id, noteText);
      if (res.success) {
        setNoteText('');
        showToast('Note added successfully');
        fetchLeadDetails(); // Reload to get notes list and history update
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setAddingNote(false);
    }
  };

  // Handle Reminder Submission
  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!reminderText.trim() || !reminderDueDate) {
      showToast('Please provide reminder text and a due date', 'error');
      return;
    }

    setAddingReminder(true);
    try {
      const res = await api.addReminder(id, {
        text: reminderText,
        dueDate: reminderDueDate
      });
      if (res.success) {
        setReminderText('');
        setReminderDueDate('');
        showToast('Reminder scheduled');
        fetchLeadDetails(); // Reload
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setAddingReminder(false);
    }
  };

  // Handle toggle reminder completed status
  const handleToggleReminder = async (reminderId) => {
    try {
      const res = await api.toggleReminder(id, reminderId);
      if (res.success) {
        showToast('Reminder updated');
        fetchLeadDetails(); // Reload
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editForm.name.trim()) errors.name = 'Name is required';
    if (!editForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      errors.email = 'Valid email is required';
    }
    if (!editForm.phone.trim()) errors.phone = 'Phone number is required';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      const res = await api.updateLead(id, editForm);
      if (res.success) {
        setLead(res.data);
        setIsEditing(false);
        showToast('Profile updated successfully');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Check reminder overdue status
  const getReminderStatusClass = (reminder) => {
    if (reminder.completed) return 'completed-tag';
    const isOverdue = new Date(reminder.dueDate) < new Date();
    return isOverdue ? 'overdue' : 'pending';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading lead profile details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="main-content">
        <div className="glass-card empty-state">
          <AlertCircle size={40} className="empty-state-icon" style={{ color: '#f87171' }} />
          <h3>Lead Not Found</h3>
          <p>The lead profile you are looking for might have been deleted.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Get initials for profile avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="main-content">
      {/* Toast Notification */}
      {toast && (
        <div className={`notification ${toast.type}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation & Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary btn-icon" onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem', display: 'inline-flex', gap: '0.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Leads</span>
        </button>
      </div>

      <div className="profile-grid">
        {/* Sidebar Info Card */}
        <div className="profile-sidebar">
          <div className="glass-card" style={{ padding: 0 }}>
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">{getInitials(lead.name)}</div>
              <h2>{lead.name}</h2>
              <span className={`status-badge ${lead.status.toLowerCase()}`}>{lead.status}</span>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {isEditing ? (
                <form onSubmit={handleSaveProfile}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    {editErrors.name && <div className="form-error">{editErrors.name}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                    {editErrors.email && <div className="form-error">{editErrors.email}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                    {editErrors.phone && <div className="form-error">{editErrors.phone}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Source</label>
                    <select
                      className="filter-select"
                      style={{ width: '100%' }}
                      value={editForm.source}
                      onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    >
                      <option value="Website Contact Form">Website Form</option>
                      <option value="Manual Entry">Manual Entry</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Cold Outreach">Cold Outreach</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }}>
                      Save
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Email Address</span>
                    <span className="profile-info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} className="color-primary" />
                      <a href={`mailto:${lead.email}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {lead.email}
                      </a>
                    </span>
                  </div>

                  <div className="profile-info-item">
                    <span className="profile-info-label">Phone Number</span>
                    <span className="profile-info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} className="color-primary" />
                      <a href={`tel:${lead.phone}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {lead.phone}
                      </a>
                    </span>
                  </div>

                  <div className="profile-info-item">
                    <span className="profile-info-label">Lead Source</span>
                    <span className="profile-info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} className="color-primary" />
                      {lead.source}
                    </span>
                  </div>

                  <div className="profile-info-item">
                    <span className="profile-info-label">Created Date</span>
                    <span className="profile-info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} className="color-primary" />
                      {new Date(lead.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setIsEditing(true)}>
                      Edit Details
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status Funnel Switcher Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Funnel Stage Management</h3>
            <select
              className="filter-select"
              style={{ width: '100%', paddingRight: '2.25rem' }}
              value={lead.status}
              onChange={handleStatusChange}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Main Details Panel */}
        <div className="profile-main">
          {/* Notes Card */}
          <div className="glass-card">
            <div className="section-header">
              <h3 className="section-title">
                <FileText size={18} className="color-primary" />
                <span>Client Notes ({lead.notes.length})</span>
              </h3>
            </div>

            <div className="notes-container">
              {lead.notes.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                  No notes available. Write the first note below.
                </p>
              ) : (
                lead.notes.map((note) => (
                  <div key={note._id} className="note-item">
                    <div className="note-header">
                      <span className="note-author">{note.createdBy}</span>
                      <span className="note-date">
                        {new Date(note.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="note-text">{note.text}</div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="note-form">
              <textarea
                className="input-field note-input"
                placeholder="Add a new update note..."
                rows="2"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                disabled={addingNote}
              ></textarea>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }} disabled={addingNote || !noteText.trim()}>
                Post
              </button>
            </form>
          </div>

          {/* Reminders Card */}
          <div className="glass-card">
            <div className="section-header">
              <h3 className="section-title">
                <Clock size={18} className="color-primary" />
                <span>Reminders Checklist</span>
              </h3>
            </div>

            <div className="reminders-list">
              {lead.reminders.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>
                  No scheduled reminders. Set a follow-up date below.
                </p>
              ) : (
                lead.reminders.map((reminder) => (
                  <div key={reminder._id} className={`reminder-item ${reminder.completed ? 'completed' : ''}`}>
                    <div className="reminder-checkbox-wrapper" onClick={() => handleToggleReminder(reminder._id)}>
                      <div className={`reminder-checkbox ${reminder.completed ? 'checked' : ''}`}>
                        {reminder.completed && <Check size={12} />}
                      </div>
                      <span className="reminder-text">{reminder.text}</span>
                    </div>
                    
                    <span className={`reminder-due-tag ${getReminderStatusClass(reminder)}`}>
                      <Calendar size={12} />
                      <span>
                        {new Date(reminder.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddReminder} className="reminder-form-inline">
              <input
                type="text"
                className="input-field"
                placeholder="Follow-up call, contract proposal..."
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                disabled={addingReminder}
              />
              <input
                type="date"
                className="input-field"
                value={reminderDueDate}
                onChange={(e) => setReminderDueDate(e.target.value)}
                disabled={addingReminder}
              />
              <button type="submit" className="btn btn-primary btn-icon" style={{ padding: '0.75rem' }} disabled={addingReminder || !reminderText.trim() || !reminderDueDate}>
                <Plus size={18} />
              </button>
            </form>
          </div>

          {/* Activity Log Card */}
          <div className="glass-card">
            <div className="section-header">
              <h3 className="section-title">
                <History size={18} className="color-primary" />
                <span>Audit Activity History</span>
              </h3>
            </div>

            <div className="timeline">
              {lead.history.slice().reverse().map((hist, index) => (
                <div key={hist._id} className={`timeline-item ${index === 0 ? 'highlight' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="timeline-action">{hist.action}</span>
                    {hist.details && <span className="timeline-details">{hist.details}</span>}
                    <span className="timeline-date">
                      {new Date(hist.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadProfile;
