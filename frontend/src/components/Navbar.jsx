import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Layers, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <Layers size={24} className="color-primary" style={{ stroke: 'url(#indigo-cyan-gradient)' || '#6366f1' }} />
        <span>CRM</span>
      </Link>
      
      {/* SVG Gradient definitions for icons */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <linearGradient id="indigo-cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </svg>

      <div className="nav-user">
        <div className="nav-user-info">
          <div className="nav-username">{user?.username}</div>
          <div className="nav-useremail">{user?.email}</div>
        </div>
        <button className="btn btn-secondary btn-icon" onClick={handleLogout} title="Log Out">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
