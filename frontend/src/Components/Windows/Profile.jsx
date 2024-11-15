// Profile.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar';
import axios from 'axios';
import './Profile.css';

// Configuración de axios para solicitudes con CSRF
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const client = axios.create({
    baseURL: "http://127.0.0.1:8000" // Base URL de tu API
});

const Profile = ({ user = {}, handleLogout }) => {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    RFC: '',
    bio: '',
    phone_number: ''
  });

  const [errorMessage, setErrorMessage] = useState('');

  // Función para cargar datos del perfil cuando la página se carga
  useEffect(() => {
    client.get('/api/profile')
      .then((response) => {
        const profileData = response.data;
        setFormData({
          name: profileData.name,
          last_name: profileData.last_name,
          phone_number: profileData.phone_number,
          RFC: profileData.RFC,
          aboutMe: profileData.bio,
        }); 
      })
      .catch((error) => {
        console.error('Error loading profile data:', error);
        setErrorMessage('Failed to load profile data. Please log in again.');
      });
  }, []);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Guardar cambios en el perfil
  const handleSave = (e) => {
    e.preventDefault();
    client.put('/api/profile', formData)
      .then(() => {
        setErrorMessage('Profile updated successfully.');
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        setErrorMessage('Error updating profile. Please try again.');
      });
  };

  return (
    <div className="profile">
      <Navbar handleLogout={handleLogout} />
      <h1>Profile Page</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <form className="profile-form" onSubmit={handleSave}>
        <div className="profile-field">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="profile-field">
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
        <div className="profile-field">
          <label>Phone Number:</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>
        <div className="profile-field">
          <label>RFC:</label>
          <input
            type="text"
            name="RFC"
            value={formData.RFC}
            onChange={handleChange}
          />
        </div>
        <div className="profile-field">
          <label>Bio:</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default Profile;

