// TransactionsTable.jsx
import React, {useState} from 'react';
import '../Tables/TransactionsTable.css';

const UserListTable = ({ users, onEditTransaction, onDeleteTransaction }) => {

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

    const sortedData = [...users].sort((a, b) => {
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
                        {/* Header */}

                        <div className="row header">
                            <div className="cell"> </div>
                        
                            <div className="cell" onClick={() => handleSort("User ID")}> 
                                User ID  {sortBy === "user_id" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>

                            <div className="cell" onClick={() => handleSort("Email")}>
                                Email {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>

                            <div className="cell" onClick={() => handleSort("Username")}>
                                Username {sortBy === "username" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>

                            <div className="cell"></div>
                            <div className="cell"></div>
                        </div>
                        
                        {/* Body */}
                        {sortedData.length > 0 ? (
                            sortedData
                            .filter(item => item.username.includes(searchTerm))
                            .map((user, index) => (
                                <div className="row" key={user.id}>
                                    <div className="cell" data-title="check"> 
                                        <input type="checkbox" id="selected" value="scales"/>
                                    </div>
                                    <div className="cell" data-title="User ID">{user.user_id}</div>
                                    <div className="cell" data-title="Email">{user.email}</div>
                                    <div className="cell" data-title="Username">{user.username}</div>
                                    
                                    <div className="cell" data-title="Button"> 
                                        <button onClick={() => onEditTransaction(user)} className="iconb">
                                            <img
                                                src="https://img.icons8.com/?size=100&id=AuMLFRmG95tQ&format=png&color=000000" 
                                                alt="Edit icon"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        </button>  
                                    </div>

                                    <div className="cell" data-title="Button" > 
                                        <button onClick={() => onDeleteTransaction(user) } className="iconb">
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
                                <div className="cell" colSpan="6">No users yet</div>
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

export default UserListTable;
