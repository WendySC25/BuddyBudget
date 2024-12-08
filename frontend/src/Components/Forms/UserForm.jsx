import React, { useState, useEffect } from "react";
import client from "../../apiClient";
import '../Windows/Transactions.css';

const UserForm = ({ userToEdit, onSaveUser }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (userToEdit) {
            setUsername(userToEdit.username);
            setEmail(userToEdit.email);
            setPassword('');
        }
    }, [userToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            username,
            email,
            password: password || undefined, 
        };

        if (userToEdit) {
            // Update existing user
            const endpoint = `/api/users/${userToEdit.id}/`;
            client.put(endpoint, data)
                .then(() => setMessage('User updated successfully!'))
                .catch((error) => {
                    console.error('Error while updating user:', error.response?.data || error.message);
                    setMessage('Failed to update user');
                });
        } else {
            // Create new user
            const endpoint = '/api/register';
            client.post(endpoint, data)
                .then(() => setMessage('User created successfully!'))
                .catch((error) => {
                    console.error('Error while creating user:', error.response?.data || error.message);
                    setMessage('Failed to create user');
                });
        }

        onSaveUser()

    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="user-form">
                        <div className="form-field">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={userToEdit ? "Leave blank to keep current password" : "Enter password"}
                                required={!userToEdit} // Required only for new users
                            />
                        </div>
                    </div>

                    <button type="submit">
                        {userToEdit ? 'Update User' : 'Add User'}
                    </button>
                    <button
                        type="button"
                        onClick={() => onSaveUser()}
                    >
                        Cancel
                    </button>
                    {message && <p className="message">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default UserForm;
