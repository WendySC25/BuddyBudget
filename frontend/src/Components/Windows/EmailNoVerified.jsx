import React from 'react';
import { Link } from 'react-router-dom';
import './../LoginRegister/LoginRegister.css'; // Estilamos con el mismo CSS que Login/Register
import { FaTimesCircle } from 'react-icons/fa';

const EmailVerified = () => {
  return (
    <div className="wrapper">
      <div className="form-box">
        <div className="content">
          <FaTimesCircle className="verification-icon" />
          <h1>Email Verified Unsuccessfully</h1>
          <p>Your account has not been verified</p>
          <Link to="/login">
            <button className="login-button">Go to Login</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;