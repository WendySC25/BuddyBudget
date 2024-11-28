    // Transactions.jsx
    import React,{ useState, useEffect } from 'react';
    import Navbar from '../NavBar/Navbar';
    import TransactionsTable from '../Tables/TransactionsTable';
    import './Transactions.css'
    import axios from 'axios';
    import client from '../../apiClient.jsx';

    // Configuración de axios para solicitudes con CSRF
    axios.defaults.xsrfCookieName = 'csrftoken';
    axios.defaults.xsrfHeaderName = 'X-CSRFToken';
    axios.defaults.withCredentials = true;

    const Transactions = ({ handleLogout }) => {

        const [transactions, setTransactions] = useState([]); // State to hold all transactions
        const [showForm, setShowForm] = useState(false); //state for showing transactions form
        const [showFormC, setShowFormC] = useState(false); //state for showing categories form
        const [showFormA, setShowFormA] = useState(false); //state for showing categories form
        const [transactionType, setTransactionType] = useState('');
        const [category, setCategories] = useState([]); //array for options *they must come from db* *distingued by type*
        const [selectedCategory, setSelectedCategory] = useState(category[0] || ''); //CATEGORIES
        const [isAddingCategory, setIsAddingCategory] = useState(false); //for tracking if its dropdown or field
        const [account, setAccount] = useState([]); //array for options *they must come from db*
        const [selectedAccount, setSelectedAccount] = useState(category[0] || ''); //ACCOUNTS
        const [isAddingAccount, setIsAddingAccount] = useState(false);//for tracking if its dropdown or field
        const [amount, setAmount] = useState('');
        const [description, setDescription] = useState('');
        const [category_name,setCategory_name] = useState('');
        const [account_name,setAccount_name] = useState('');
        const [bank_name,setBank_name] = useState('');
        const [date, setDate] = useState('');
        const [message, setMessage] = useState('');

        //fetch transactions
        useEffect(() =>{ 
            fetchAllT();
            fetchAllC();
            fetchAllA();
        }, []);

        useEffect(() => {
            const background = document.querySelector('.table-container');
            if (background) {
                if (showForm || showFormC) {
                    background.classList.add('blurred');
                } else {
                    background.classList.remove('blurred');
                }
            }
        }, [showForm, showFormC, showFormA]);
        

        const fetchAllT = async () => {
            const token = localStorage.getItem('authToken');
            try{
                const responseT = await client.get('/api/transactions', {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setTransactions(responseT.data);
                console.log('Fetched transaciones:', responseT.data);

            }catch(error){
                console.error('Error while fetching transactions', error);
            }
        };  

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

        //submit for transactions
        const handleSubmit = (e) => { 
            e.preventDefault();

            const data = {
                category: [selectedCategory],
                account: selectedAccount,
                amount: amount,
                description: description,
                date: date,
                type: transactionType,
            };

            const endpoint = '/api/transactions';
            client.post(endpoint,data)
            .then(() => {
                setTransactionType('');
                setAmount('');
                setDescription('');
                setDate('');
                setSelectedCategory('');
                setSelectedAccount('');
                setMessage(`${transactionType} added successfully!`);
                setShowForm(false);
                fetchAllT();    
                setTimeout(() => setMessage(''), 3000);
                

            })
            .catch((error) => {
                console.error('Error while creting transaction:', error);
                setMessage('Failed to add transaction');
            });
            
        };

        //submit for categories //JUST NAME
        const handleAddCategory = () => {
            //missing logic for the type 
            const newCategory = prompt("Enter the new category name:");
            if (newCategory && !category.includes(newCategory)) {
                setCategories([...category, newCategory]);
                setSelectedCategory(newCategory);
            }
            setIsAddingCategory(false); 
        };
        //WHOLE FORM
        const handleSubmitC = (e) => { 
            e.preventDefault();  //THERES A BIG BUG IN HERE

            const data = {
            isAddingCategory: true, 
            category_name: category_name,
            };
            setCategories([...category, data]);

            const endpoint = '/api/categories/';
            client.post(endpoint,data)
            .then(() => {
                setCategory_name('');
                setDescription('');
                setMessage(`Category added successfully!`);
                setShowForm(false);
                setMessage('');
            })
            .catch((error) => {
                console.error('Error while creating category:', error.response?.data || error.message);
                setMessage('Failed to add category');
            });
            
        };

        //submit for accounts //JUST NAME
        const handleAddAccount = () => {
            //missing logic for 
            const newAccount = prompt("Enter the new account name:");
            if (newAccount && !account.includes(newAccount)) {
                setAccount([...account, newAccount]);
                setSelectedAccount(newAccount);
            }
            setIsAddingAccount(false);
        };
        //WHOLE FORM
        const handleSubmitA = (e) => { 
            e.preventDefault();  //THERES A BIG BUG IN HERE

            const data = {
            isAddingAccount: true, 
            account_name: account_name,
            bank_name: bank_name,
            amount: amount,
            date: date,
            };
            setAccount([...account, data]);

            const endpoint = '/api/accounts/';
            client.post(endpoint,data)
            .then(() => {
                setAccount_name('');
                setBank_name('');
                setAmount('');
                setDate('');
                setMessage(`Account added successfully!`);
                setShowForm(false);
                setMessage('');
            })
            .catch((error) => {
                console.error('Error while creating account:', error.response?.data || error.message);
                setMessage('Failed to add account');
            });
            
        };

        return (
            <div className="transaction">
            <Navbar handleLogout={handleLogout} />
            <h1>Transactions Page</h1>

            <div className="table-container">
                <div className="table-header-buttons">
                <button
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Transaction'}
                </button>
                <button
                    onClick={() => setShowFormC(!showFormC)}
                >
                    {showFormC ? 'Cancel' : '+ Add Category'}
                </button>
                <button
                    onClick={() => setShowFormA(!showFormA)}
                >
                    {showFormA ? 'Cancel' : '+ Add Account'}
                </button>
                </div>
                {/* Table */} <TransactionsTable transactions={transactions} />
            </div>
                {showForm && (
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
                            <form onSubmit={handleSubmit}>
                                <div className="transaction-form">
                                    {/* Amount Field */}
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

                                    {/* Description Field */}
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

                                    {/* Date Field */}
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
                                        {isAddingCategory ? (
                                            <input
                                                type="text"
                                                placeholder="Enter new category"
                                                onBlur={(e) => handleAddCategory(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleAddCategory(e.target.value);
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <select
                                                id="category"
                                                value={selectedCategory}
                                                onChange={(e) => {
                                                    if (e.target.value === "add_new") {
                                                        setIsAddingCategory(true);
                                                    } else {
                                                        setSelectedCategory(e.target.value);
                                                    }
                                                }}
                                            >
                                                {category.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.category_name}
                                                    </option>
                                                ))}
                                                <option value="add_new">+ Add New Category</option>
                                            </select>
                                        )}
                                    </div>

                                    {/* Account Dropdown */}
                                    <div className="account-dropdown">
                                        <label htmlFor="account">Account</label>
                                        {isAddingAccount ? (
                                            <input
                                                type="text"
                                                placeholder="Enter new account"
                                                onBlur={(e) => handleAddAccount(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleAddAccount(e.target.value);
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <select
                                                id="account"
                                                value={selectedAccount}
                                                onChange={(e) => {
                                                    if (e.target.value === "add_new") {
                                                        setIsAddingAccount(true);
                                                    } else {
                                                        setSelectedAccount(e.target.value);
                                                    }
                                                }}
                                            >
                                                <option value="" disabled>
                                                    Select an account
                                                </option>
                                                {account.map((acc) => (
                                                    <option key={acc.id} value={acc.id}>
                                                        {acc.account_name}
                                                    </option>
                                                ))}
                                                <option value="add_new">+ Add New Account</option>
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button type="submit" disabled={!transactionType}>
                                    Add Transactions
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(!showForm)}
                                >
                                    Cancel
                                </button>
                                {message && <p className="message">{message}</p>}
                            </form>
                        </div>
                    </div>
                )}

                {showFormC && (
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
                            <form onSubmit={handleSubmitC}>
                                <div className="transaction-form">
                                    <div className="transaction-field">
                                        <label htmlFor="name">Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={category_name}
                                            onChange={(e) => setCategory_name(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit">Add Category</button>
                                <button
                                    type="button"
                                    onClick={() => setShowFormC(!showFormC)}
                                >
                                    Cancel
                                </button>
                                {message && <p className="message">{message}</p>}
                            </form>
                        </div>
                    </div>
                )}

                {showFormA && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <form onSubmit={handleSubmitA}>
                                <div className="transaction-form">
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
                                    <div className="transaction-field">
                                        <label htmlFor="name">Bank</label>
                                        <input
                                            type="text"
                                            id="bank"
                                            value={bank_name}
                                            onChange={(e) => setBank_name(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="transaction-field">
                                        <label htmlFor="amount">Account number</label>
                                        <input
                                            type="number"
                                            id="amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="transaction-field">
                                        <label htmlFor="date">Expiring Date</label>
                                        <input
                                            type="date"
                                            id="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit">Add Account</button>
                                <button
                                    type="button"
                                    onClick={() => setShowFormA(!showFormA)}
                                >
                                    Cancel
                                </button>
                                {message && <p className="message">{message}</p>}
                            </form>
                        </div>
                    </div>
                )}
  
            </div>
        );
    };

    export default Transactions;
