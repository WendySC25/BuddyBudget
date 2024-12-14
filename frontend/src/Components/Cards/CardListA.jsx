import React, { useState, useEffect } from 'react';
import './CardList.css';
import SearchBarWithFilter from '../Serchbar/SerchBarWithFilters';

const CardListA = ({ accounts, onEditAccount, onDeleteAccount, isAdmin }) => {
  const [filteredAccounts, setFilteredAccounts] = useState(accounts);
  const allOptions = [
    { value: 'account_name', label: 'Account Name', type: 'texto' },
    { value: 'user', label: 'User ID', type: 'texto' },
    { value: 'account_type', label: 'Account Type', type: 'texto' },
    { value: 'bank_name', label: 'Bank Name', type: 'texto' },
    { value: 'expiry_date', label: 'Expiry Date', type: 'rango_fechas' }, 
  ];

  const options = allOptions.filter(option => {
    if (option.value === "user") {
        return isAdmin; 
    }
    return true;
});

  useEffect(() => {
    setFilteredAccounts(accounts);
}, [accounts]);

  const handleSearch = (searchTerm, selectedOption, minValue, maxValue, startDate, endDate) => {
    if (!selectedOption) {
      setFilteredAccounts(accounts);
      return;
    }

    let filtered = accounts;

    const selectedType = options.find((opt) => opt.value === selectedOption)?.type;

    if (selectedType === 'texto') {
      filtered = accounts.filter((account) =>
        account[selectedOption]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (selectedType === 'rango_fechas') {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filtered = accounts.filter((account) => {
        const accountDate = new Date(account[selectedOption]);
        return accountDate >= start && accountDate <= end;
      });
    }

    setFilteredAccounts(filtered);
  };

  return (
    <div className="account-container">
      {/* SearchBarWithFilter */}
      <SearchBarWithFilter
        options={options}
        onSearch={handleSearch}
      />

      {/* Cards */}
      {filteredAccounts.length > 0 ? (
        <div className="card-list">
          {filteredAccounts.map((account, index) => (
            <article className="card" key={index}>
              <div className="card-header">
                {account.account_name}

                <div className="button-group">
                  <button onClick={() => onEditAccount(account)} className="icon-button">
                    <img
                      src="https://img.icons8.com/?size=100&id=AuMLFRmG95tQ&format=png&color=000000"
                      alt="Edit icon"
                    />
                  </button>
                  <button onClick={() => onDeleteAccount(account)} className="icon-button">
                    <img
                      src="https://img.icons8.com/?size=100&id=68064&format=png&color=000000"
                      alt="Trash can icon"
                    />
                  </button>
                </div>
              </div>

              <div className="card-footer">
                {isAdmin && <div className="card-meta">User ID: {account.user}</div>}
              </div>
              <div className="card-meta">{account.account_type}</div>

              {account.account_type !== 'CASH' && (
                <div>
                  <div className="card-meta">Bank: {account.bank_name}</div>
                  <div className="card-meta">Account number: {account.account_number}</div>
                  <div className="card-meta">Expiry date: {account.expiry_date}</div>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (

        <div className="card-list">
          <p>No accounts available</p>
        </div>
        
      )}
    </div>
  );
};

export default CardListA;
