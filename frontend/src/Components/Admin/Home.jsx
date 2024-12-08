import React from 'react';
import { Outlet } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <Outlet /> {/* Aquí se renderizan las rutas secundarias */}
        </div>
    );
};

export default Home;
