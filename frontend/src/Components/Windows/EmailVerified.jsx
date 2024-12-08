import React from 'react';
import { Link } from 'react-router-dom';
import './EmailVerified.css';
import logo__light from '../Assets/BuddyBudget_black.png';

const EmailVerified = () => {
  return (
    <div className="email-verified">
      <nav className="navbar">
        <img src={logo__light} alt="Logo" className="logo" />
      </nav>
      <div className="content">
        <h2>Email Verified Successfully</h2>
        <p>Your account has been verified. You can now log in.</p>
        <Link to="/login">
          <button className="login-button">Login</button>
        </Link>
      </div>
    </div>
  );
};

export default EmailVerified;
