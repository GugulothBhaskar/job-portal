import React, { useEffect, useState } from 'react';
import './home.css'; // Ensure this CSS file exists and is styled appropriately
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const handleLoginClick = () => {
    navigate('/login');
  };
  const handleGoBack = () => {
    navigate('/home');
  };

  return (
    <div className="home-container">
      <div className="home-background">
        <button className="home-login-btn" onClick={handleLoginClick}>
         Login
        </button>
        <div className="message-container">
          <h1>Welcome to Job Portal</h1>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;