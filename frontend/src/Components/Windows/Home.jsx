// Home.jsx
import React from 'react';
import Navbar from '../NavBar/Navbar';
import CardItem from './CardItem.jsx';

import './Home.css';

const Home = ({ handleLogout }) => {
    return (
        <div className="home">
            <Navbar handleLogout={handleLogout} />
            {/* <CardItem /> */}
        </div>
    );
};

export default Home;


