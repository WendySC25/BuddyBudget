import React, { useState } from 'react';
import LoginRegister from './Components/LoginRegister/LoginRegister';
import Home from './Components/Windows/Home';
import client from './apiClient'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // autentication state
  const [username, setUsername] = useState('');  // state for save username

  // Function to handle login
  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setUsername(username);
  };

  // Function to handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    client.post("/api/logout", { withCredentials: true })
        .then(res => {
            console.log("Logout successful:", res.data);
            setIsAuthenticated(false);
            setUsername(''); // clean username when close
        })
        .catch(error => {
            console.error("Logout error:", error);
        });
};

  return (
    <div>
      {isAuthenticated ? (
        <Home username={username} handleLogout={handleLogout} />
      ) : (
        <LoginRegister handleLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
