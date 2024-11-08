// Home.jsx
import React from 'react';
import Navbar from '../NavBar/Navbar';
import './Home.css';

const Home = ({ username, handleLogout }) => {
    return (
        <div className="home">
            <Navbar handleLogout={handleLogout} />
            <h1>Welcome Seldon {username}!</h1>
            <p>This is the Home page.</p>
        </div>
    );
};

export default Home;


