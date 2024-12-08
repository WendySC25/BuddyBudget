
import React,{ useState, useEffect } from 'react';
import './CardList.css'


const CardListA = ({accounts, onEditAccount, onDeleteAccount, isAdmin}) => {
  
  return (
    accounts.length > 0 ? (
      <div className="card-list">
        {accounts.map((account, index) => (
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
                    alt="Trash can icon "
                  />
                </button>
              </div>
            </div>

            <div className="card-footer">
             {isAdmin && ( <div className='card-meta' > User ID: {account.user} </div>)}         
            </div>
            <div className='card-meta' > {account.account_type} </div>

            {account.account_type != 'CASH' && (
            <div>
                <div className='card-meta' > Bank: {account.bank_name} </div>
                <div className='card-meta' > Account number: {account.account_number} </div>
                <div className='card-meta' > Expiry date: {account.expiry_date} </div>
            </div>
            )}
            

          </article>
        ))}
      </div>
    ) : (
      <p>No accounts available</p> 
    )
  );
   
};

export default CardListA;
