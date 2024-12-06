// Home.jsx
import React, {useEffect, useState} from 'react';
import Navbar from '../NavBar/Navbar';
import client from '../../apiClient.jsx';
import UserListTable from '../Admin/UserListTable.jsx';
import './Home.css';

const Superhome = ({ handleLogout }) => {

    const [users, setUsers] = useState([])

    useEffect(() =>{ 
        fetchAllU();
    }, []);

    const fetchAllU = async () => {
        try {   
            const response = await client.get('/api/userlist/', {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            setUsers(response.data)

        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    
    return (
        
        <div className="home">
            <Navbar handleLogout={handleLogout} /> 
            <UserListTable 
                users={users}
            />
        </div>
    );
};

export default Superhome;


