import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);

  // Function to handle login
  const handleLogin = (token) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true);
  };

  // Function to handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    client.post("/api/logout", {}, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
        .then(res => {
            console.log("Logout successful:", res.data);
        })
        .catch(error => {
            console.error("Logout error:", error);
        });
};

useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    client
      .get('/api/user', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        console.log('User validated:', res.data);
        setIsAuthenticated(true);
      })
      .catch((error) => {
        console.error('Token validation failed:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
  } else {
    setLoading(false);
  }
}, []);

if (loading) {
  return <div>Loading...</div>;
}

  return (
    <Router>
      <Routes>
        {/* Redirige a /home si el usuario está autenticado, si no, a login */}
        <Route
          path="/"
          element={loading?<div>Loading...</div>:isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
        
        {/* Rutas protegidas que verifican la autenticación */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home handleLogout={handleLogout} /> : <Navigate to="/login" />}
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
