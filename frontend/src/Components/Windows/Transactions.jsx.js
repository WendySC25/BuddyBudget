// Transactions.jsx
import React,{ useState } from 'react';
import Navbar from '../NavBar/Navbar';
import './Transactions.css'

const Transactions = ({ handleLogout }) => {

    const [transactionType, setTransactionType] = useState('');
    const [category, setCategories] = useState([]); //array for options
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
    const handleAddCategory = (newCategory) => {
        //const newCategory = prompt("Enter the new category name:");
        if (newCategory && !category.includes(newCategory)) {
            setCategories([...category, newCategory]);
            setSelectedCategory(newCategory);
        }
        setIsAddingCategory(false); 
    };

    //adding new account
    const handleAddAccount = (newAccount) => {
        //const newAccount = prompt("Enter the new account name:");
        if (newAccount && !account.includes(newAccount)) {
            setAccount([...account, newAccount]);
            setSelectedAccount(newAccount);
        }
        setIsAddingAccount(false);
    };

    const handleSubmit = (e) => { //faltan cases
        e.preventDefault();
        setMessage(`Transaction added successfully to ${transactionType}!`);
    };
    
  return (
    <div className="transaction">
      <Navbar handleLogout={handleLogout} />
      <h1>Transactions Page</h1>
      {/* Transaction Type Buttons */}
      <div className="transaction-type-buttons">
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
            </div>
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
                            {account.map((acc, index) => (
                                <option key={index} value={acc}>{acc}</option>
                            ))}
                            <option value="add_new">+ Add New Account</option>
                        </select>
                    )}
                </div>
            </div>

                <button type="submit"disabled={!transactionType}>Add Transaction</button>
                {message && <p className="message">{message}</p>}
            </form>
    </div>
  );
};

export default Transactions;