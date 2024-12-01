// TransactionForm.jsx
import React,{ useState, useEffect } from 'react';
import '../Windows/Transactions.css';
import axios from 'axios';
import client from '../../apiClient.jsx';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const TransactionForm = ({ onSaveTransaction, onEdit, transactionToEdit }) => {
    const [categories, setCategories] = useState([]);
    const [accounts, setAccount] = useState([]);

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [date, setDate] = useState('');
    const [message, setMessage] = useState('');
   
    useEffect(() =>{ 
        fetchAllC();
        fetchAllA();

        if (transactionToEdit) {
            setAmount(transactionToEdit.amount);
            setDescription(transactionToEdit.description);
            setTransactionType(transactionToEdit.transactionType);
            setSelectedCategories(transactionToEdit.category.map((cat) => cat.id));
            setSelectedAccount(transactionToEdit.account.id);
            setDate(transactionToEdit.date);
        }
    }, [transactionToEdit]);

    const fetchAllC = async () => {
        try {   
            const responseC = await client.get('/api/categories/', {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            setCategories(responseC.data);
            console.log('Fetched categories:', responseC.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchAllA = async () => {
        try {   
            const responseA = await client.get('/api/accounts/', {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            setAccount(responseA.data);
            console.log('Fetched accounts:', responseA.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleCategoryChange = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const handleSubmit = (e) => { 
        e.preventDefault();

        const data = {
            category: selectedCategories,
            account: selectedAccount,
            amount: amount,
            description: description,
            date: date,
            type: transactionType,
        };

        console.log(data)

        if (transactionToEdit) {
            const endpoint = `/api/transactions/${transactionToEdit.id}/`;
            client.put(endpoint, data)
            .then(()=> {
                setMessage(`${transactionType} added successfully!`); 
                setTimeout(() => setMessage(''), 3000);
                
            })
            .catch(error => {
                console.error('Error updating transaction:', error);
                setMessage('Error updating transaction');
            });
            
        } else {
            const endpoint = '/api/transactions/';
            client.post(endpoint,data)
            .then(() => {
                setMessage(`${transactionType} added successfully!`);   
                
            })
            .catch((error) => {
                console.error('Error while creting transaction:', error);
                setMessage('Failed to add transaction');
            });
        }

        setTransactionType('');
        setAmount('');
        setDescription('');
        setDate('');
        setSelectedCategories('');
        setSelectedAccount('');
        setSelectedCategories([]);   
        setTimeout(() => setMessage(''), 3000);
        onSaveTransaction();  
    
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="transaction-type-buttons">
                    <button
                        type="button"
                        onClick={() => setTransactionType('INC')}
                        className={transactionType === 'INC' ? 'active-income' : ''}
                    >
                        Income
                    </button>

                    <button
                        type="button"
                        onClick={() => setTransactionType('EXP')}
                        className={transactionType === 'EXP' ? 'active-expense' : ''}
                    >
                        Expense
                    </button>
                </div>

                <div className={`transaction-form-container ${ transactionType ? 'show-form' : ''}`}>
                    {transactionType && (
                        <form onSubmit={handleSubmit}>
                            <div className="transaction-form">
                                <div className="transaction-field">
                                    <label htmlFor="amount">Amount</label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="transaction-field">
                                    <label htmlFor="description">Description</label>
                                    <input
                                        type="text"
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="transaction-field">
                                    <label htmlFor="date">Date</label>
                                    <input
                                        type="date"
                                        id="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* Category Dropdown */}
                                <div className="category-dropdown">
                                        <label htmlFor="category">Category</label>
                                        <div className="categories-container">
                                            {categories
                                            .filter((cat) => cat.type === transactionType) 
                                            .map((filteredCategory) => (
                                                // This line
                                            <div key={filteredCategory.id} className="category-item">
                                                <label>
                                                    <input
                                                    type="checkbox"
                                                    value={filteredCategory.id}
                                                    checked={selectedCategories.includes(filteredCategory.id)}
                                                    onChange={() => handleCategoryChange(filteredCategory.id)}
                                                    />
                                                    {filteredCategory.category_name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="account-dropdown">
                                    <label htmlFor="account">Account</label>
                                    <select
                                        id="account"
                                        value={selectedAccount}
                                        onChange={(e) => setSelectedAccount(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>
                                            Select an account
                                        </option>
                                        {accounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.account_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={!transactionType}>
                                {transactionToEdit ? 'Update Transaction' : 'Add Transaction'}
                            </button>
                            <button
                                type="button"
                                onClick={() => onSaveTransaction()}
                            >
                                Cancel
                            </button>
                            {message && <p className="message">{message}</p>}
                        </form>
                    )} 
                </div>
            </div>
        </div>
    );
};

export default TransactionForm;
