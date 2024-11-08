// Transactions.jsx
import React from 'react';
import Navbar from '../NavBar/Navbar';
import './Home.css'; // Reutiliza el CSS de Home

const Reports = ({ handleLogout }) => {
  return (
    <div className="home">
      <Navbar handleLogout={handleLogout} />
      <h1>Reports Page</h1>
    </div>
  );
};

export default Reports;