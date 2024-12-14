import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginRegister from './Components/LoginRegister/LoginRegister';
import Home from './Components/Windows/Home';
import Transactions from './Components/Windows/Transactions';
import Profile from './Components/Windows/Profile';
import Reports from './Components/Windows/Reports';
import Configuration from './Components/Windows/Configuration';
import Debts from './Components/Windows/Debts';
import client from './apiClient'; 
import Categories from './Components/Windows/Categories';
import EmailVerified from './Components/Windows/EmailVerified.jsx';
import EmailNoVerified from './Components/Windows/EmailNoVerified.jsx';
import AdminRoutes from './Components/Admin/AdminRoutes';
import Accounts from './Components/Windows/Account';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // autentication state
  const [isSuperuser, setIsSuperuser] = useState(false); // to manage the admin UI
  const [loading, setLoading] = useState(true);

  // Function to handle login
  const handleLogin = (token) => {
    sessionStorage.setItem('authToken', token)
    setIsAuthenticated(true);

    client.get('/api/user', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => {
      if(res.data.user.is_staff) {
        setIsSuperuser(true);
        console.log('is staff')
        console.log('is staff')
        console.log('is staff')
        console.log('is staff')
        console.log('is staff')
        console.log('is staff')
      }
    })
  };

  // Function to handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('authToken');
    sessionStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setIsSuperuser(false);
    client.post("/api/logout", {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => console.log("Logout successful:", res.data))
      .catch(error => console.error("Logout error:", error));
  };

useEffect(() => {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    client
      .get('/api/user', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        console.log('User validated:', res.data);
        setIsAuthenticated(true);
        if (res.data.user.is_staff) {
          setIsSuperuser(true);
        } else {
          setIsSuperuser(false);
        }
      })
      .catch((error) => {
        console.error('Token validation failed:', error);
        setIsAuthenticated(false);
        sessionStorage.removeItem('token');
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
          element={
            loading ? <div>Loading...</div> :
            isAuthenticated ? (isSuperuser ? <Navigate to="/superhome/home" /> : <Navigate to="/home" />) : 
            <Navigate to="/login" />
          }
        />
        
        {/* Rutas protegidas que verifican la autenticación */}
        <Route
          path="/home"
          element={
            isAuthenticated ? (isSuperuser ? <Navigate to="/superhome/" /> : <Home handleLogout={handleLogout}/>) :
            <Navigate to="/login" />}
        />
        
        <Route
          path="/transactions"
          element={isAuthenticated ? <Transactions handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/debts"
          element={isAuthenticated ? <Debts handleLogout={handleLogout} /> : <Navigate to="/login" />}
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
         <Route
          path="/categories"
          element={isAuthenticated ? <Categories handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/email-unverified" element={<EmailNoVerified />} />


        <Route
          path="/accounts"
          element={isAuthenticated ? <Accounts handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        {/* Página de login, Redirección Inicial */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <LoginRegister handleLogin={handleLogin} />}
        />

        <Route 
          path="/superhome/*" 
          element={(isAuthenticated && isSuperuser) ? <AdminRoutes handleLogout={handleLogout}/> : <Navigate to="/login" />} 
        />


      </Routes>
    </Router>
  );
}

export default App;
