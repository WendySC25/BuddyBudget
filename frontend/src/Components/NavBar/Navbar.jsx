// Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo__light from '../Assets/BuddyBudget_black.png';

const Navbar = ({ handleLogout }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="navbar">
            <img src={logo__light} alt="Logo" className="logo" />
            <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                &#9776; {/* Hamburguer Icon */}
            </div>
            <ul className={menuOpen ? 'open' : ''}>
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/transactions">Transactions</Link></li>
                <li><Link to="/debts">Debts</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/reports">Reports</Link></li>
                <li><Link to="/configuration">Configuration</Link></li>
                <li><Link to="/categories">Categories</Link></li>
                <li><Link to="/accounts">Accounts</Link></li>
                <li onClick={handleLogout} style={{ cursor: 'pointer', color: 'red' }}>Logout</li>
            </ul>
        </div>
    );
};

export default Navbar;
