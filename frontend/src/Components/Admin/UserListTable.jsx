// TransactionsTable.jsx
import React, {useState, useEffect } from 'react';
import '../Tables/TransactionsTable.css';
import SearchBarWithFilter from '../Serchbar/SerchBarWithFilters';

const UserListTable = ({ users, onEditUser, onDeleteUser }) => {

    const options = [
        { value: "user_id", label: "User ID", type: "texto" },
        { value: "email", label: "Email", type: "texto" }, 
        { value: "username", label: "Username", type: "texto" },
    ];

    useEffect(() => {
        setFilteredData(users);
        
    }, [users]);

    const [sortBy, setSortBy] = useState(""); 
    const [sortOrder, setSortOrder] = useState("asc");
    const [filteredData, setFilteredData] = useState(users);
    
    const handleSort = (key) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortOrder("asc");
        }
    };

    const handleSearch = (searchTerm, selectedOption) => {
        if (!selectedOption) {
          setFilteredData(users);
          return;
        }
      
        const filtered = users.filter((user) =>
          user[selectedOption]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
        setFilteredData(filtered);
      };
      
      const sortedData = [...filteredData].sort((a, b) => {
        if (sortBy === "") return 0; // Si no hay campo seleccionado para ordenar, no cambia el orden
      
        const aValue = a[sortBy]?.toString().toLowerCase() || "";
        const bValue = b[sortBy]?.toString().toLowerCase() || "";
      
        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
        }
      });
    return (
       
        <div className="limiter">
            <SearchBarWithFilter
                options ={options}
                onSearch={handleSearch  }
            />
            <div className="container-table100">
                <div className="wrap-table100">
                    <div className="table">
                        {/* Header */}

                        <div className="row header">
                        
                            <div className="cell" onClick={() => handleSort("User ID")}> 
                                User ID  {sortBy === "user_id" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>

                            <div className="cell" onClick={() => handleSort("Email")}>
                                Email {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>

                            <div className="cell" onClick={() => handleSort("Username")}>
                                Username {sortBy === "username" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>

                            <div className="cell">
                                Staff
                            </div>

                            <div className="cell">
                                Email verified
                            </div>

                            <div className="cell"></div>
                            <div className="cell"></div>
                        </div>
                        
                        {/* Body */}
                        {sortedData.length > 0 ? (
                            sortedData
                            .map((user, index) => (
                                <div className="row" key={user.id}>
                                    <div className="cell" data-title="User ID">{user.user_id}</div>
                                    <div className="cell" data-title="Email">{user.email}</div>
                                    <div className="cell" data-title="Username">{user.username}</div>
                                    <div className="cell" data-title="Username">
                                        {user.is_staff ? "YES" : "NO"}
                                    </div>

                                    <div className="cell" data-title="Username">
                                        {user.is_active ? "YES" : "NO"}
                                    </div>
                                    
                                    <div className="cell" data-title="Button"> 
                                        <button onClick={() => onEditUser(user)} className="iconb">
                                            <img
                                                src="https://img.icons8.com/?size=100&id=AuMLFRmG95tQ&format=png&color=FFFFFF" 
                                                alt="Edit icon"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        </button>  
                                    </div>

                                    <div className="cell" data-title="Button" > 
                                        <button onClick={() => onDeleteUser(user) } className="iconb">
                                            <img
                                                src="https://img.icons8.com/?size=100&id=68064&format=png&color=FFFFFF" 
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
                                
                            </div>
                        )}
                    </div>
                </div>
                </div>
                </div>
        

    );
};

export default UserListTable;
