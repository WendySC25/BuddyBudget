// Transactions.jsx
import React,{ useState } from 'react';
import Navbar from '../NavBar/Navbar';
import './Home.css'
const Transactions = ({ handleLogout }) => {

    const [category, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [account, setAccount] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
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
    };

    //adding new account
    const handleAddAccount = () => {
        const newAccount = prompt("Enter the new account name:");
        if (newAccount && !account.includes(newAccount)) {
            setAccount([...account, newAccount]);
            setSelectedAccount(newAccount);
        }
    };

    const handleSubmit = (e) => { //faltan cases
        e.preventDefault();
        setMessage(`Transaction added successfully to ${selectedCategory}!`);
    };
    
  return (
    <div className="transaction">
      <Navbar handleLogout={handleLogout} />
      <h1>Transactions Page</h1>
      <form onSubmit={handleSubmit}>

                <div className="profile-field">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => {
                            if (e.target.value === "add_new") {
                                handleAddCategory();
                            } else {
                                setSelectedCategory(e.target.value);
                            }
                        }}
                        className="category-dropdown"
                    >
                        {category.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                        <option value="add_new">+ Add New Category</option>
                    </select>
                </div>

                <div className="profile-field">
                    <label htmlFor="account">Account</label>
                    <select
                        id="account"
                        value={selectedAccount}
                        onChange={(e) => {
                            if (e.target.value === "add_new") {
                                handleAddAccount();
                            } else {
                                setSelectedAccount(e.target.value);
                            }
                        }}
                        className="account-dropdown"
                    >
                        {account.map((account, index) => (
                            <option key={index} value={account}>{account}</option>
                        ))}
                        <option value="add_new">+ Add New Account</option>
                    </select>
                </div>

                <div className="profile-field">
                    <label htmlFor="amount">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>

                <div className="profile-field">
                    <label htmlFor="description">Tag</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="profile-field">
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Add Transaction</button>
                {message && <p className="message">{message}</p>}
            </form>
    </div>
  );
};

export default Transactions;
