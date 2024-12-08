
import React from 'react';

const MainContainer = ({ children }) => {
    return (
        <main className="main-container">
            <div className="main-content">{children}</div>
        </main>
    );
};

export default MainContainer;
