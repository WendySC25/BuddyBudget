// Profile.jsx
import React, { useState } from 'react';
import Navbar from '../NavBar/Navbar';
import './Profile.css';

const Profile = ({ user = {}, handleLogout }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    fullName: user.fullName || '',
    phone: user.phone || '',
    address: user.address || '',
    bornDate: user.bornDate || '',
    CURP: user.CURP || '',
    RFC: user.RFC || '',
    aboutMe: user.aboutMe || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    console.log('Datos guardados:', formData);
  };

  return (
    <div className="profile">
      <Navbar handleLogout={handleLogout} />
      <h1>Profile Page</h1>
      <div className="profile-form">
        <div className="profile-field">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className="profile-field">
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>
        <div className="profile-field">
          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="profile-field">
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div className="profile-field">
          <label>Born Date:</label>
          <input
            type="date"
            name="bornDate"
            value={formData.bornDate}
            onChange={handleChange}
          />
        </div>
        <div className="profile-field">
          <label>CURP:</label>
          <input
            type="text"
            name="CURP"
            value={formData.CURP}
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
          <label>About Me:</label>
          <textarea
            name="aboutMe"
            value={formData.aboutMe}
            onChange={handleChange}
          />
        </div>
        <button onClick={handleSave}>Save</button>
      </div>
      <div className="profile-buttons">
        <button onClick={() => console.log('Edit Username')}>Edit Username</button>
        <button onClick={() => console.log('Edit Email')}>Edit Email</button>
        <button onClick={() => console.log('Edit Password')}>Edit Password</button>
      </div>
    </div>
  );
};

export default Profile;
