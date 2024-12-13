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

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Saving user with ID:", userToEdit.user_id);

        try {
            const data = { username, email };
            if (password) data.password = password; // Only include password if provided

            if (userToEdit) {
                // Update existing user
                await client.put(`/api/users/${userToEdit.user_id}/`, data);
                setMessage('User updated successfully!');
            } else {
                // Create new user
                await client.post('/api/register', data);
                setMessage('User created successfully!');
            }

            setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
            onSaveUser(); // Notify parent about completion
        } catch (error) {
            console.error('Error saving user:', error.response?.data || error.message);
            setMessage('Failed to save user. Please check the details.');
        }

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
