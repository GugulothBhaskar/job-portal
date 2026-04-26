import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import NotificationBell from './NotificationBell';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('USER');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');

    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setRole(storedRole);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
          💼 Job Portal
        </div>
      </div>

      <div className="navbar-center">
        <input type="text" placeholder="Search jobs, companies..." />
      </div>

      <div className="navbar-right">
        <div className="navbar-role">
          {role}
        </div>

        <NotificationBell />

        <div className="navbar-avatar">
          {username ? username.charAt(0).toUpperCase() : 'U'}
        </div>

        <button className="navbar-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;