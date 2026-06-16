import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Trash2,
  X,
  Plus,
  AlertCircle,
  Check
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Dashboard state
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  // Create Lead Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website Contact Form',
    status: 'New',
    notes: ''
  });
  const [modalErrors, setModalErrors] = useState({});
  const [submittingLead, setSubmittingLead] = useState(false);
  
  // Notification system state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const leadsRes = await api.getLeads({
        search,
        status: statusFilter,
        source: sourceFilter,
        sort: sortBy
      });
      const statsRes = await api.getAnalytics();
      
      if (leadsRes.success) setLeads(leadsRes.data);
      if (statsRes.success) setAnalytics(statsRes.data);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search/filter fetch
  useEffect(() => {
    fetchDashboardData();
  }, [search, statusFilter, sourceFilter, sortBy]);

  // Lead Modal Validation
  const validateNewLead = () => {
    const errors = {};
    if (!newLead.name.trim()) errors.name = 'Name is required';
    if (!newLead.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newLead.email)) {
      errors.email = 'Please provide a valid email';
    }
    if (!newLead.phone.trim()) errors.phone = 'Phone number is required';
    
    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle lead creation submit
  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!validateNewLead()) return;
    
    setSubmittingLead(true);
    try {
      const res = await api.createLead(newLead);
      if (res.success) {
        showToast('Lead created successfully');
        setIsModalOpen(false);
        setNewLead({
          name: '',
          email: '',
          phone: '',
          source: 'Website Contact Form',
          status: 'New',
          notes: ''
        });
        fetchDashboardData();
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSubmittingLead(false);
    }
  };

  // Handle lead delete
  const handleDeleteLead = async (id, e) => {
    e.stopPropagation(); // Stop row click navigation
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const res = await api.deleteLead(id);
        if (res.success) {
          showToast('Lead deleted successfully');
          fetchDashboardData();
        }
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  };

  // Colors for Status Donut Chart
  const statusColors = {
    New: '#818cf8',      // Indigo
    Contacted: '#fbbf24',// Amber
    Qualified: '#c084fc',// Violet
    Converted: '#34d399',// Emerald
    Lost: '#f87171'      // Rose
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

      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Welcome back, {user?.username}</h1>
          <p>Here is an overview of your client acquisition funnel.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Analytics KPI Dashboard */}
      {analytics && (
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Leads</span>
              <span className="stat-value">{analytics.summary.totalLeads}</span>
            </div>
            <div className="stat-icon-wrapper">
              <Users size={22} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-info">
              <span className="stat-label">New Leads</span>
              <span className="stat-value">{analytics.summary.newLeads}</span>
            </div>
            <div className="stat-icon-wrapper" style={{ color: '#818cf8', background: 'rgba(129, 140, 248, 0.12)' }}>
              <UserPlus size={22} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-info">
              <span className="stat-label">Converted</span>
              <span className="stat-value">{analytics.summary.convertedLeads}</span>
            </div>
            <div className="stat-icon-wrapper" style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.12)' }}>
              <CheckCircle size={22} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-info">
              <span className="stat-label">Conversion Rate</span>
              <span className="stat-value">{analytics.summary.conversionRate}%</span>
            </div>
            <div className="stat-icon-wrapper" style={{ color: '#22d3ee', background: 'rgba(34, 211, 238, 0.12)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts Panel */}
      {analytics && (
        <div className="charts-grid">
          {/* Trend Area Chart */}
          <div className="glass-card chart-card-large">
            <div className="chart-header">
              <h3 className="chart-title">Lead Generation Trend (Last 30 Days)</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trendBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-app)', borderColor: 'var(--border-glass)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                    itemStyle={{ color: 'var(--color-primary)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" name="Leads" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Donut Chart */}
          <div className="glass-card chart-card-small">
            <div className="chart-header">
              <h3 className="chart-title">Funnel Stages</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-app)', borderColor: 'var(--border-glass)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Pie
                    data={analytics.statusBreakdown.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {analytics.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#ccc'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem', fontSize: '0.8rem' }}>
              {analytics.statusBreakdown.map((entry) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColors[entry.name] }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{entry.name}: <strong>{entry.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Leads Board Panel */}
      <div className="glass-card">
        <div className="chart-header" style={{ marginBottom: '1rem' }}>
          <h3 className="chart-title">Leads Database</h3>
        </div>

        {/* Filters Controls */}
        <div className="table-controls">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="input-field search-input"
              placeholder="Search leads by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} className="color-primary" style={{ color: 'var(--text-muted)' }} />
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <select className="filter-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
              <option value="All">All Sources</option>
              <option value="Website Contact Form">Website Form</option>
              <option value="Manual Entry">Manual Entry</option>
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Cold Outreach">Cold Outreach</option>
            </select>

            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Leads Table */}
        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <Users size={40} className="empty-state-icon" />
            <h3>No Leads Found</h3>
            <p>Try modifying your search query or filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Lead Info</th>
                  <th>Phone Number</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/leads/${lead._id}`)}>
                    <td>
                      <div className="lead-meta">
                        <span className="lead-name">{lead.name}</span>
                        <span className="lead-email">{lead.email}</span>
                      </div>
                    </td>
                    <td>{lead.phone}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{lead.source}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${lead.status.toLowerCase()}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      {new Date(lead.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn btn-secondary btn-icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/${lead._id}`);
                          }}
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn btn-danger btn-icon" 
                          onClick={(e) => handleDeleteLead(lead._id, e)}
                          title="Delete Lead"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h2>Add New CRM Lead</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Jane Doe"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                />
                {modalErrors.name && <div className="form-error">{modalErrors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="jane.doe@example.com"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                />
                {modalErrors.email && <div className="form-error">{modalErrors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                />
                {modalErrors.phone && <div className="form-error">{modalErrors.phone}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Source</label>
                  <select
                    className="filter-select"
                    style={{ width: '100%', paddingRight: '2.25rem' }}
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  >
                    <option value="Website Contact Form">Website Form</option>
                    <option value="Manual Entry">Manual Entry</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="filter-select"
                    style={{ width: '100%', paddingRight: '2.25rem' }}
                    value={newLead.status}
                    onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Note (Optional)</label>
                <textarea
                  rows="3"
                  className="input-field note-input"
                  placeholder="Add details about this lead..."
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingLead}>
                  {submittingLead ? 'Adding...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
