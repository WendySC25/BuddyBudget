// TransactionForm.jsx
import React, { useState } from 'react';
import '../Windows/Transactions.css';

const TransactionForm = ({
    transactionType,
    setTransactionType,
    categories,
    accounts,
    handleSubmit,
    setShowForm,
}) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');

    const handleCategoryChange = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit({
            category: selectedCategories,
            account: selectedAccount,
            amount,
            description,
            date,
            type: transactionType,
        });
        setAmount('');
        setDescription('');
        setDate('');
        setSelectedCategories([]);
        setSelectedAccount('');
    };

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

                {transactionType && (
                    <form onSubmit={handleFormSubmit}>
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
                            <div className="category-dropdown">
                                <label htmlFor="category">Category</label>
                                <div className="categories-container">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="category-item">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    value={cat.id}
                                                    checked={selectedCategories.includes(cat.id)}
                                                    onChange={() => handleCategoryChange(cat.id)}
                                                />
                                                {cat.category_name}
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
                            Add Transaction
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TransactionForm;
