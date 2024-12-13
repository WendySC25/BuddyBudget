// PasswordForm.jsx
import React, { useState } from 'react';
import client from '../../apiClient.jsx';

const PasswordForm = ({ currentPassword, onUpdate }) => {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    // Cambiar newEmail a newPassword
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await client.put(
                '/api/profile',
                { bio: newPassword },
                { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } }
            );
            onUpdate(newPassword); // Notifica al padre sobre el cambio de nombre
            setMessage('Password updated successfully!');
            setTimeout(() => setMessage(''), 3000);
            setNewPassword('');
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage('Failed to update password.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="transaction-form">
                        <div className="transaction-field">
                            <label htmlFor="currentPassword">Current Password</label>
                            <p id="currentPassword" className="readonly-field">{currentPassword}</p>
                        </div>
                        <div className="transaction-field">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="text"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit">Update Password</button>

                    <button type="button" onClick={onUpdate}>
                        Cancel
                    </button>
                    {message && <p className="message">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default PasswordForm;
