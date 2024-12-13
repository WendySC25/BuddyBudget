// UsernameForm.jsx
import React, { useState } from 'react';
import client from '../../apiClient.jsx';

const UsernameForm = ({ currentUsername, onUpdate, userId }) => {
    const [newUsername, setNewUsername] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await client.put(
                `/api/users/${userId}/`,
                { username: newUsername },
                { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } }
            );
            onUpdate(newUsername); // Notifica al padre sobre el cambio de nombre
            setMessage('Username updated successfully!');
            setTimeout(() => setMessage(''), 3000);
            setNewUsername('');
        } catch (error) {
            console.error('Error updating username:', error);
            setMessage('Failed to update username.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="transaction-form">
                        <div className="transaction-field">
                            <label htmlFor="currentUsername">Current Username</label>
                            <p id="currentUsername" className="readonly-field">{currentUsername}</p>
                        </div>
                        <div className="transaction-field">
                            <label htmlFor="newUsername">New Username</label>
                            <input
                                type="text"
                                id="newUsername"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter new username"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit">Update Username</button>

                    <button type="button" onClick={onUpdate}>
                        Cancel
                    </button>
                    {message && <p className="message">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default UsernameForm;
