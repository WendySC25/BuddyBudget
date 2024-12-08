import React, {useState, useEffect} from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Sidebar from '../Sidebar/Sidebar';
import MainContainer from './MainContainer';
import UserListTable from './UserListTable';
import client from '../../apiClient.jsx';
import UsersCategory from './UsersCategory.jsx';
import TransactionsTable from '../Tables/TransactionsTable.jsx';
import DebtsTable from '../Tables/DebtsTable.jsx';

const AdminRoutes = () => {

    const [users, setUsers] = useState([])
    const [categories, setCategories] = useState([])
    const [t,setT] = useState([]);
    const [d,setDebts] = useState([]);

    useEffect(() =>{ 
        fetchAllU();
        fetchAllC();
        fetchAllT();
        fetchAllD();
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

    const fetchAllC = async () => {
        try {   
            const response = await client.get('/api/categories/', {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            setCategories(response.data)

        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchAllT = async () => {
        try {   
            const response = await client.get('/api/transactions/', {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            setT(response.data)

        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchAllD = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await client.get('/api/debts', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDebts(response.data);
            console.log('Fetched debts:', response.data);
        } catch (error) {
            console.error('Error while fetching debts', error);
        }
    };

    return (
        <div className="container">
            <Sidebar/>
            
            <div className="wrapper1">
            <header className="header">     
            </header>
            {/* <Header /> */}
            <MainContainer>
                <Routes>
                    <Route path="/" element={<Home />}>
                        {/* Rutas internas de Superhome */}
                        <Route index element={<Home />} />
                        <Route path="subpage1" element={<UserListTable users={users} />} />
                        <Route path="transactions" element={<TransactionsTable transactions={t} />} />
                        <Route path="categories" element={<UsersCategory categories={categories} />} />
                        <Route path="debts" element={<DebtsTable debts={d} />} />
                        
                    </Route>
                </Routes>
            </MainContainer>
            </div>
        </div>
    );  
};

export default AdminRoutes;
