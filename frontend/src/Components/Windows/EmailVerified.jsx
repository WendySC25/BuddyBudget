import React from 'react';
import { Link } from 'react-router-dom';
import './../LoginRegister/LoginRegister.css'; // Estilamos con el mismo CSS que Login/Register
import { FaCheckCircle } from 'react-icons/fa';

const EmailVerified = () => {
  return (
    <div className="wrapper">
      <div className="form-box">
        <div className="content">
          <FaCheckCircle className="verification-icon" />
          <h1>Email Verified Successfully</h1>
          <p>Your account has been verified. You can now log in.</p>
          <Link to="http://localhost:3000/login">
            <button className="login-button">Go to Login</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;

