// TransactionsTable.jsx
import React, {useState} from 'react';
import './TransactionsTable.css';

const TransactionsTable = ({ transactions, onEditTransaction, onDeleteTransaction }) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(""); 
    const [sortOrder, setSortOrder] = useState("asc");
    
    const handleSort = (key) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortOrder("asc");
        }
    };

    const sortedData = [...transactions].sort((a, b) => {
        if (sortBy === "") {
            return sortOrder === "asc" ? -1 : 1;
        }

        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (sortOrder === "asc") {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
        }
    });

    return (
        <div className="limiter">
            <div className="container-table100">
                <div className="wrap-table100">
                    <div className="table">
                         <div className="row">
                            <div className="cell">
                                <img 
                                    src="https://img.icons8.com/?size=100&id=7695&format=png&color=000000"
                                    alt="Serch icon"
                                    style={{ width: '24px', height: '24px' }}
                                />
                            </div>
                            <div className="cell">
                                <input 
                                    type="text" 
                                    placeholder="Search by description"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="serchbar"
                                />
                            </div>
                            <div className="cell"></div>
                            <div className="cell"></div>
                            <div className="cell"></div>
                            <div className="cell"></div>
                            <div className="cell"></div>
                            <div className="cell"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-table100">
                <div className="wrap-table100">
                    <div className="table">
                        {/* Header */}

                        <div className="row header">
                            <div className="cell" onClick={() => handleSort("type")}> 
                                Type  {sortBy === "type" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>

                            <div className="cell" onClick={() => handleSort("amount")}>
                                Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>

                            <div className="cell" onClick={() => handleSort("description")}>
                                Description {sortBy === "description" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>

                            <div className="cell" onClick={() => handleSort("date") }>
                                Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>

                            <div className="cell" >Category</div>

                            <div className="cell" onClick={() => handleSort("account")}>
                                Account {sortBy === "account.name" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>
                            
                            <div className="cell"></div>
                            <div className="cell"></div>
                        </div>
                        
                        {/* Body */}
                        {sortedData.length > 0 ? (
                            sortedData
                            .filter(item => item.description.includes(searchTerm))
                            .map((transaction, index) => (
                                <div className="row" key={transaction.id}>
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
                                            ? transaction.category.map((cat, idx) => (
                                                <span
                                                    className="tag"
                                                    style={{
                                                        backgroundColor: cat.color,
                                                        color: "black", // Ensure text is readable on light backgrounds
                                                    }}
                                                >
                                                    {cat.category_name}
                                                </span> ))
                                            : 'No category'}
                                    </div>
                                    <div className="cell" data-title="Account">
                                        {transaction.account && typeof transaction.account === 'object'
                                            ? transaction.account.account_name || 'Unnamed Account'
                                            : 'No account'}
                                    </div>

                                    <div className="cell" data-title="Button"> 
                                        <button onClick={() => onEditTransaction(transaction)} className="icon-button">
                                            <img
                                                src="https://img.icons8.com/?size=100&id=AuMLFRmG95tQ&format=png&color=000000" 
                                                alt="Edit icon"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        </button>  
                                    </div>

                                    <div className="cell" data-title="Button"> 
                                        <button onClick={() => onDeleteTransaction(transaction) } className="icon-button">
                                            <img
                                                src="https://img.icons8.com/?size=100&id=68064&format=png&color=000000" 
                                                alt="Trash can icon "
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        </button>  
                                    </div>
                                    
                                </div>
                            ))
                        ) : (
                            <div className="row">
                                <div className="cell" colSpan="6">No transactions yet</div>
                                <div className="cell"></div>
                                <div className="cell"></div>
                                <div className="cell"></div>
                                <div className="cell"></div>
                                <div className="cell"></div>
                                <div className="cell"></div>
                                <div className="cell"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionsTable;
