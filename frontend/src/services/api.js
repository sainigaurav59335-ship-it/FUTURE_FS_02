const API_BASE_URL = 'https://future-fs-02-hdle.onrender.com/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    // If unauthorized, clear token and refresh or redirect
    if (response.status === 401) {
      localStorage.removeItem('crm_token');
    }
    const errorMsg = data.error || response.statusText || 'Request failed';
    throw new Error(errorMsg);
  }
  
  return data;
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('crm_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Lead endpoints
  getLeads: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.source) query.append('source', params.source);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);

    const response = await fetch(`${API_BASE_URL}/leads?${query.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getLeadById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createLead: async (leadData) => {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(leadData),
    });
    return handleResponse(response);
  },

  updateLead: async (id, leadData) => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(leadData),
    });
    return handleResponse(response);
  },

  deleteLead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  addNote: async (leadId, text) => {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },

  addReminder: async (leadId, reminderData) => {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/reminders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reminderData),
    });
    return handleResponse(response);
  },

  toggleReminder: async (leadId, reminderId) => {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/reminders/${reminderId}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/leads/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
