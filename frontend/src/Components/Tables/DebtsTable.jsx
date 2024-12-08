import React from 'react';
import './TransactionsTable.css';

const DebtsTable = ({ debts, onEditDebt, onDeleteDebt }) => {
    return (
        <div className="limiter">
            <div className="container-table100">
                <div className="wrap-table100">
                    <div className="table">
                        {/* Header / Encabezado de la tabla */}
                        <div className="row header">
                            <div className="cell">Description</div>
                            <div className="cell">Creditor</div>
                            <div className="cell">Amount</div>
                            <div className="cell">Months to Pay</div>
                            <div className="cell">Has Interest</div>
                            <div className="cell">Last Payment Date</div>
                            <div className="cell"></div>
                            <div className="cell"></div>
                        </div>
                        
                        {/* Body */}
                        {debts.length > 0 ? (
                            debts.map((debt) => (
                                <div className="row" key={debt.id}>
                                    <div className="cell" data-title="Description">{debt.description}</div>
                                    <div className="cell" data-title="Creditor">{debt.creditor}</div>
                                    <div className="cell" data-title="Amount">{debt.amount}</div>
                                    <div className="cell" data-title="Months to Pay">{debt.months_to_pay}</div>
                                    <div className="cell" data-title="Has Interest">
                                        {debt.has_interest ? "Yes" : "No"}
                                    </div>
                                    <div className="cell" data-title="Last Payment Date">{debt.last_payment_date}</div>
                                    <div className="cell" data-title="Button"> 
                                        <button onClick={() => onEditDebt(debt)} className="icon-button">
                                            <img
                                                src="https://img.icons8.com/?size=100&id=AuMLFRmG95tQ&format=png&color=000000" 
                                                alt="Edit icon"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        </button>  
                                    </div>
                                    <div className="cell" data-title="Button"> 
                                        <button onClick={() => onDeleteDebt(debt)} className="icon-button">
                                            <img
                                                src="https://img.icons8.com/?size=100&id=68064&format=png&color=000000" 
                                                alt="Trash can icon"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        </button>  
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="row">
                                <div className="cell" colSpan="6">No debts found</div>
                                <div className="cell"></div>
                                <div className="cell"></div>
                                <div className="cell"></div>
                                <div className="cell"></div>
                                <div className="cell"></div>
                                <div className="cell"></div> <div className="cell"></div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebtsTable;
