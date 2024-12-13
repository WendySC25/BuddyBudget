import React, {useState, useEffect} from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Sidebar from '../Sidebar/Sidebar';
import MainContainer from './MainContainer';
import client from '../../apiClient.jsx';
import Transactions from '../Windows/Transactions.jsx';
import Debts from '../Windows/Debts.jsx';
import Categories from '../Windows/Categories.jsx';
import Accounts from '../Windows/Account.jsx';
import Users from './Users.jsx';

const AdminRoutes = () => {
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
                        <Route path="users" element={<Users/>} />
                        <Route path="transactions" element={<Transactions isAdmin = {true} />} />
                        <Route path="categories" element={<Categories isAdmin={true} /> } />
                        <Route path="accounts" element={<Accounts isAdmin = {true} />} />
                        <Route path="debts" element={<Debts isAdmin={true}/>} />
                        
                    </Route>
                </Routes>
            </MainContainer>
            </div>
        </div>
    );  
};

export default AdminRoutes;
