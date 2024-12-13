// UsernameForm.jsx
import React, { useState } from 'react';
import client from '../../apiClient.jsx';

const EmailForm = ({ currentEmail, onUpdate, userId }) => {
    const [newEmail, setNewEmail] = useState('');
    const [message, setMessage] = useState('');

    // Cambiar newUsername a newEmail 
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await client.put(
                `/api/users/${userId}/`,
                { email: newEmail },
                { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } }
            );
            onUpdate(newEmail); // Notifica al padre sobre el cambio de nombre
            setMessage('Email updated successfully!');
            setTimeout(() => setMessage(''), 3000);
            setNewEmail('');
        } catch (error) {
            console.error('Error updating email:', error);
            setMessage('Failed to update email.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="transaction-form">
                        <div className="transaction-field">
                            <label htmlFor="currentEmail">Current Email</label>
                            <p id="currentEmail" className="readonly-field">{currentEmail}</p>
                        </div>
                        <div className="transaction-field">
                            <label htmlFor="newEmail">New Email</label>
                            <input
                                type="text"
                                id="newEmail"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter new email"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit">Update email</button>

                    <button type="button" onClick={onUpdate}>
                        Cancel
                    </button>
                    {message && <p className="message">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default EmailForm;
