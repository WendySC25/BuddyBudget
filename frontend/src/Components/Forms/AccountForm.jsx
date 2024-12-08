// AccountForm.jsx
import React, {useState} from 'react';
import '../Windows/Transactions.css';
import client from '../../apiClient.jsx';

const AccountForm = ({ onSaveAccount, isAdmin }) => {

    const [account_number, setAccount_number] = useState('');
    const [user_id, setUser] = useState(0);
    const [account_name,setAccount_name] = useState('');
    const [bank_name,setBank_name] = useState('');
    const [expiry_date, setExpiryDate] = useState('');
    const [account_type, setAccountType] = useState('');
    
    const [message, setMessage] = useState('');

    const handleSubmitA = (e) => { 
        e.preventDefault();

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

        const endpoint = '/api/accounts/';
        client.post(endpoint,data)
        .then(() => {
            setMessage(`Account added successfully!`);
        })
        .catch((error) => {
            console.error('Error while creating account:', error.response?.data || error.message);
            setMessage('Failed to add account');
        });

        onSaveAccount();
        
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmitA}>
                    <div className="transaction-form">

                        {isAdmin && (
                            <div className="transaction-field">
                                <label htmlFor="user id">User ID</label>
                                    <input
                                        type="number"
                                        id="user_id"
                                        value={user_id}
                                        onChange={(e) => setUser(e.target.value)}
                                        required
                                    />
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
                    <button type="submit">Add Account</button>
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