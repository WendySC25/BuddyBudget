import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginRegister from './Components/LoginRegister/LoginRegister';
import Home from './Components/Windows/Home';
import Transactions from './Components/Windows/Transactions';
import Profile from './Components/Windows/Profile';
import Reports from './Components/Windows/Reports';
import Configuration from './Components/Windows/Configuration';
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
    <Router>
      <Routes>
        {/* Redirige a /home si el usuario está autenticado, si no, a login */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
        
        {/* Rutas protegidas que verifican la autenticación */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home username={username} handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/transactions"
          element={isAuthenticated ? <Transactions handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/reports"
          element={isAuthenticated ? <Reports handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/configuration"
          element={isAuthenticated ? <Configuration handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        {/* Página de login, Redirección Inicial */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <LoginRegister handleLogin={handleLogin} />}
        />
      </Routes>
    </Router>
  );
}

export default App;

