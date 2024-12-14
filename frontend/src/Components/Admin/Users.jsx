// Users.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar';
import UserListTable from './UserListTable.jsx';
import UserForm from '../Forms/UserForm.jsx';
import client from '../../apiClient.jsx';

const Users = ({ handleLogout, isAdmin }) => {
    const [users, setUsers] = useState([]);
    const [userToEdit, setUserToEdit] = useState(null);
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        const appName = document.querySelector('meta[name="app-name"]').getAttribute('content');
        document.title = `Users - ${appName}`;
      }, []);

    useEffect(() => {
        fetchAllUsers();
        const background = document.querySelector('.table-container');
        if (background) {
            if (showForm) {
                background.classList.add('blurred');
            } else {
                background.classList.remove('blurred');
            }
        }
    }, [showForm]);

    const fetchAllUsers = async () => {
        const token = sessionStorage.getItem('authToken');
        try {
            const response = await client.get('/api/userlist/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
            console.log('Fetched users:', response.data);
        } catch (error) {
            console.error('Error while fetching users', error);
        }
    };

    const handleSaveUser = () => {
        fetchAllUsers();
        setUserToEdit(null);
        setShowForm(false);
    };

    const handleDeleteUser = async (userToDelete) => {

        const endpoint = `/api/users/${userToDelete.user_id}/delete/`;   
        try {
            await client.delete(endpoint, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
            });
            console.log(`User with ID ${userToDelete.user_id} deleted successfully.`);
            setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== userToDelete.user_id));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEditUser = (user) => {
        setUserToEdit(user);
        setShowForm(true);
    };


    return (
        <div className="transaction">
             {!isAdmin && (<Navbar handleLogout={handleLogout} />)}
            <h1>Users Management</h1>

            <div className="table-container">
                <div className="table-header-buttons">
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add User'}
                    </button>
                </div>

                <UserListTable
                    users={users}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                />
            </div>

            {showForm && (
                <UserForm
                    userToEdit={userToEdit}
                    onSaveUser={handleSaveUser}
                />
            )}
        </div>
    );
};

export default Users;
