// TransactionsTable.jsx
import React from 'react';
import './TransactionsTable.css';

const TransactionsTable = ({ transactions }) => {
    return (
        <div className="limiter">
            <div className="container-table100">
                <div className="wrap-table100">
                    <div className="table">
                        {/* Header */}
                        <div className="row header">
                            <div className="cell">Type</div>
                            <div className="cell">Amount</div>
                            <div className="cell">Description</div>
                            <div className="cell">Date</div>
                            <div className="cell">Category</div>
                            <div className="cell">Account</div>
                        </div>
                        {/* Body */}
                        {transactions.length > 0 ? (
                            transactions.map((transaction, index) => (
                                <div className="row" key={index}>
                                    <div className="cell" data-title="Type">
                                        {transaction.type === 'INC' ? (
                                            <img
                                                src="https://img.icons8.com/ios-filled/50/000000/income.png"
                                                alt="Income Icon"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        ) : transaction.type === 'EXP' ? (
                                            <img
                                                src="https://img.icons8.com/ios-filled/50/000000/expense.png"
                                                alt="Expense Icon"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        ) : (
                                            'Unknown'
                                        )}
                                    </div>
                                    <div className="cell" data-title="Amount">{transaction.amount}</div>
                                    <div className="cell" data-title="Description">{transaction.description}</div>
                                    <div className="cell" data-title="Date">{transaction.date}</div>
                                    <div className="cell" data-title="Category">
                                        {Array.isArray(transaction.category) && transaction.category.length > 0
                                            ? transaction.category.map(cat => cat.category_name).join(', ')
                                            : 'No category'}
                                    </div>
                                    <div className="cell" data-title="Account">
                                        {transaction.account && typeof transaction.account === 'object'
                                            ? transaction.account.account_name || 'Unnamed Account'
                                            : 'No account'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="row">
                                <div className="cell" colSpan="6">No transactions yet</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionsTable;
