// Navbar.jsx
import React, { useState } from 'react';
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
                <li>Home</li>
                <li>Transactions</li>
                <li>Profile</li>
                <li>Reports</li>
                <li>Configuration</li>
                <li onClick={handleLogout} style={{ cursor: 'pointer', color: 'red' }}>Logout</li>
            </ul>
        </div>
    );
};

export default Navbar;
