//Accounts.jsx
import React,{ useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar.jsx';
import AccountForm from '../Forms/AccountForm.jsx';
import CardListA from '../Cards/CardListA.jsx';
import client from '../../apiClient.jsx';

import './Transactions.css'

const Accounts = ({ handleLogout, isAdmin }) => {

    const [accounts, setAccounts] = useState([]);
    const [accountToEdit, setAccountToEdit] = useState(null);
    const [showFormA, setshowFormA] = useState(false);    

    useEffect(() => {
        fetchAllA();
    }, []); 

    useEffect(() => {
        const appName = document.querySelector('meta[name="app-name"]').getAttribute('content');
        document.title = `Accounts - ${appName}`;
      }, []);

    useEffect(() =>{ 
        fetchAllA();
        const background = document.querySelector('.table-container');
        if (background) {
            if (showFormA) {
                background.classList.add('blurred');
            } else {
                background.classList.remove('blurred');
            }
        }

    }, [showFormA]);
    
    const fetchAllA = async () => {
        try {   
            const responseC = await client.get('/api/accounts/', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
            });
            setAccounts(responseC.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const handleSaveAccount = () => {
        fetchAllA()
        setshowFormA(false)
        
    };

    const handleEditAccount = (account) => {
        setAccountToEdit(account)
        console.log('ready to edit')
        setshowFormA(true)
    }; 

    const handleDeleteAccount = async (accountToDelete) => {
        const endpoint = `/api/accounts/${accountToDelete.id}/`;
        try {
            await client.delete(endpoint, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
            });
            console.log(`Account with ID ${accountToDelete.id} deleted  `);

            setAccounts((prevAccounts) =>
                prevAccounts.filter((account) => account.id !== accountToDelete.id)
            );

        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    return(
    <div className="transactions">
        <Navbar handleLogout={handleLogout} />
        <h1> Accounts </h1>

        <CardListA 
            accounts = {accounts}
            onDeleteAccount   = {handleDeleteAccount}
            onEditAccount     = {handleEditAccount}
            isAdmin={isAdmin}
        />

        {showFormA && <AccountForm
                        onSaveAccount ={handleSaveAccount}
                        accountToEdit = {accountToEdit}
                        isAdmin={isAdmin}
                    />
        }

    </div>

    );

}

export default Accounts;