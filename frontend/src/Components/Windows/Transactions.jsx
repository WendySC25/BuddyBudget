// Transactions.jsx
import React,{ useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar';
import './Transactions.css'
import axios from 'axios';
import client from '../../apiClient.jsx';

// Configuración de axios para solicitudes con CSRF
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const Transactions = ({ handleLogout }) => {

    const [transactions, setTransactions] = useState([]); // State to hold all transactions
    const [incomes,setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    const [category, setCategories] = useState([]); //array for options *they must come from db*
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false); //for tracking if its dropdown or field
    const [account, setAccount] = useState([]); //array for options
    const [selectedAccount, setSelectedAccount] = useState('');
    const [isAddingAccount, setIsAddingAccount] = useState(false);//for tracking if its dropdown or field
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [message, setMessage] = useState('');

    //adding new category
    const handleAddCategory = () => {
        const newCategory = prompt("Enter the new category name:");
        if (newCategory && !category.includes(newCategory)) {
            setCategories([...category, newCategory]);
            setSelectedCategory(newCategory);
        }
        setIsAddingCategory(false); 
    };

    //adding new account
    const handleAddAccount = () => {
        const newAccount = prompt("Enter the new account name:");
        if (newAccount && !account.includes(newAccount)) {
            setAccount([...account, newAccount]);
            setSelectedAccount(newAccount);
        }
        setIsAddingAccount(false);
    };

    //fetch transactions //might be better if we change the table 
    useEffect(() =>{ 
        const fetchAllT = async () => {
            const token = localStorage.getItem('authToken');
            try{
                const responseI = await client.get('/api/incomes', {
                    headers: {Authorization: 'Bearer ${token}'},
                });
                setIncomes(responseI.data);
            }catch(error){
                console.error('Error while fetching incomes', error);
            }

            try{
                const responseE = await client.get('/api/expenses',{
                    headers: {Authorization: 'Bearer ${token}'},
                });
                setExpenses(responseE.data);
            }catch(error){
                console.error('Error while fetching expenses', error);
            }
        };

        fetchAllT();
    }, []);

    const allTransactions = [
        ...incomes.map((income) => ({ ...income, type: 'Income' })),
        ...expenses.map((expense) => ({ ...expense, type: 'Expense' })),
      ];
    //fetch categories

    //fetch accounts

    const handleSubmit = (e) => { 
        e.preventDefault();

        const data = {
            category: selectedCategory,
            account: selectedAccount,
            amount: amount,
            description: description,
            date: date,
            //type: transactionType, //maybe delete this, might interfere with db
        };
        setTransactions([...transactions, data]);

        const endpoint = transactionType === 'income' ? '/api/incomes' : '/api/expenses';
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
            setMessage('');
          })
          .catch((error) => {
            console.error('Error while creting transaction:', error);
            setMessage('Failed to add transaction');
          });
          
    };

    
    return (
        <div className="transaction">
          <Navbar handleLogout={handleLogout} />
          <h1>Transactions Page</h1>

          <div className="table-container">
            <div className="table-header">
                {/* Button aligned to the top left */}
                <button
                className="add-transaction"
                onClick={() => setShowForm(!showForm)}
                >
                {showForm ? 'Cancel' : '+ Add Transaction'}
                </button>
            </div>

          {/* Table */}
          <table className="transaction-table">
        <thead>
          <tr>
            
            <th>Amount</th>
            <th>Description</th>
            <th>Date</th>
            <th>Category</th>
            <th>Account</th>
          </tr>
        </thead>
        <tbody>
          {allTransactions.length > 0 ? (
            allTransactions.map((transaction, index) => (
              <tr key={index}>

                <td>{transaction.amount}</td>
                <td>{transaction.description}</td>
                <td>{transaction.date}</td>
                <td>{transaction.category}</td>
                <td>{transaction.account}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No transactions yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

      {showForm && (   
        
        <><div className="transaction-type-buttons">
                <button
                    type="button"
                    onClick={() => setTransactionType('income')}
                    className={transactionType === 'income' ? 'active-income' : ''}
                >
                    Income
                </button>
                <button
                    type="button"
                    onClick={() => setTransactionType('expense')}
                    className={transactionType === 'expense' ? 'active-expense' : ''}
                >
                    Expense
                </button>
                </div><form onSubmit={handleSubmit}>
                    <div className="transaction-form">
                        <div className="transaction-field">
                            <label htmlFor="amount">Amount</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required />
                        </div>

                        <div className="transaction-field">
                            <label htmlFor="description">Description</label>
                            <input
                                type="text"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required />
                        </div>

                        <div className="transaction-field">
                            <label htmlFor="date">Date</label>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required />
                        </div>

                        {/* Category Dropdown or Input */}
                        <div className="category-dropdown">
                            <label htmlFor="category">Category</label> {/**If its true, it unchains: */}
                            {isAddingCategory ? (
                                <input
                                    type="text"
                                    placeholder="Enter new category"
                                    onBlur={(e) => handleAddCategory(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddCategory(e.target.value);
                                            e.preventDefault();
                                        }
                                    } } />
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
                                    } }
                                >
                                    {category.map((cat, index) => (
                                        <option key={index} value={cat}>{cat}</option>
                                    ))}
                                    <option value="add_new">+ Add New Category</option>
                                </select>
                            )}
                        </div>

                        {/* Account Dropdown or Input */}
                        <div className="account-dropdown">
                            <label htmlFor="account">Account</label>
                            {isAddingAccount ? (
                                <input
                                    type="text"
                                    placeholder="Enter new category"
                                    onBlur={(e) => handleAddAccount(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddAccount(e.target.value);
                                            e.preventDefault();
                                        }
                                    } } />
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
                                    } }

                                >
                                    {account.map((acc, index) => (
                                        <option key={index} value={acc}>{acc}</option>
                                    ))}
                                    <option value="add_new">+ Add New Account</option>
                                </select>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={!transactionType}>Add Transactions</button>
                    {message && <p className="message">{message}</p>}
                </form></>
            )}
        </div>
    );
};

export default Transactions;
