// AccountForm.jsx
import React, {useState, useEffect} from 'react';
import '../Windows/Transactions.css';
import client from '../../apiClient.jsx';

const AccountForm = ({ onSaveAccount, accountToEdit, isAdmin }) => {

    const [account_number, setAccount_number] = useState('');
    const [user_id, setUser] = useState('');
    const [account_name,setAccount_name] = useState('');
    const [bank_name,setBank_name] = useState('');
    const [expiry_date, setExpiryDate] = useState('');
    const [account_type, setAccountType] = useState('');
    
    const [message, setMessage] = useState('');

    const [userExists, setUserExists] = useState(null);
    const handleUserValidation = async () => {
        if (!user_id) return;
        const token = sessionStorage.getItem('authToken');
        try {
            const response = await client.get(`/api/users/${user_id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                setUserExists(true);
                setMessage('');
            }
        } catch (error) {
            console.error('User validation failed:', error);
            setUserExists(false);
            setMessage('User ID does not exist.');
        }
    };

    useEffect(() => {
        if(accountToEdit){
            setUser(accountToEdit.user);
            setAccount_number(accountToEdit.account_number);
            setAccount_name(accountToEdit.account_name);
            setBank_name(accountToEdit.bank_name);
            setAccountType(accountToEdit.account_type);
            
        }
    }, [accountToEdit]);

    const handleSubmitA = (e) => { 
        e.preventDefault();

        if (!userExists && isAdmin) {
            setMessage('Cannot submit. User ID does not exist.');
            return;
        }

        const data = {
            user_id: user_id,
            account_name: account_name,
            account_type: account_type,
            bank_name: bank_name,
            account_number: account_number,
        };

        if (account_type !== "CASH") {
            data.expiry_date = expiry_date;
        }

        if(accountToEdit){
            const endpoint = `/api/accounts/${accountToEdit.id}/`;
            client.put(endpoint, data)
            .then(() => { })
            .catch((error) => {
                console.error('Error while updating account:', error.response?.data || error.message);
                setMessage('Failed to add account');
            });

        } else {

            const endpoint = '/api/accounts/';
            client.post(endpoint,data)
            .then(() => {
                setMessage(`Account added successfully!`);
            })
            .catch((error) => {
                console.error('Error while creating account:', error.response?.data || error.message);
                setMessage('Failed to add account');
            });
        }

        onSaveAccount();
        
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmitA}>
                    <div className="transaction-form">

                        {isAdmin && (
                                <div className="transaction-field">
                                    <label htmlFor="user_id">User ID</label>
                                    <input
                                        type="number"
                                        id="user_id"
                                        value={user_id}
                                        onChange={(e) => setUser(e.target.value)}
                                        onBlur={handleUserValidation}
                                        required
                                        readOnly={!!accountToEdit}
                                    />
                                    {userExists === false && (
                                        <p className="error-message">User ID does not exist.</p>
                                    )}
                                </div>
                            )}

                        <div className="transaction-field"> 
                            <label htmlFor="name">Account Name</label>
                            <input
                                type="text"
                                id="name"
                                value={account_name}
                                onChange={(e) => setAccount_name(e.target.value)}
                                required
                            />
                        </div>

                        <div className="account-dropdown">
                            <label htmlFor="account">Account type</label>
                            <select
                                id="account_type"
                                value={account_type}
                                onChange={(e) => setAccountType(e.target.value)}
                                required
                                
                            >
                                <option value="" disabled>
                                Select the account type
                                </option>
                                <option value="CASH">Cash</option>
                                <option value="DEBIT">Debit</option>
                                <option value="CREDIT">Credit</option>
                                required
                            </select>
                        </div>

                        <div className={`transaction-form-container ${account_type === 'DEBIT' || account_type === 'CREDIT' ? 'show-form' : ''}`}> 
                            <div className="transaction-field">
                                <label htmlFor="name">Bank</label>
                                <input
                                    type="text"
                                    id="bank"
                                    value={bank_name}
                                    onChange={(e) => setBank_name(e.target.value)}
                                    
                                />
                            </div>

                            <div className="transaction-field">
                                <label htmlFor="amount">Account number</label>
                                <input
                                    type="number"
                                    id="account_number"
                                    value={account_number}
                                    onChange={(e) => setAccount_number(e.target.value)}
                                    
                                />
                            </div>

                            <div className="transaction-field">
                                <label htmlFor="expiry_date">Expiring date</label>
                                <input
                                    type="date"
                                    id="expiry_date"
                                    value={expiry_date}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                            </div>
                        </div> 

                    </div>
                    <button type="submit">
                        {accountToEdit ? 'Update Account' : 'Add Account'}
                    </button>
                    <button
                        type="button"
                        onClick={() => onSaveAccount()}
                    >
                        Cancel
                    </button>
                    {message && <p className="message">{message}</p>}
                </form>
            </div>
        </div> );
}

export default AccountForm;