import React, {useState,useEffect} from 'react';
import './TransactionsTable.css';
import SearchBarWithFilter from '../Serchbar/SerchBarWithFilters';

const DebtsTable = ({ debts, onEditDebt, onDeleteDebt, isAdmin }) => {

    const allOptions = [
        { value: "description", label: "Description", type: "texto" },
        { value: "creditor", label: "Creditor", type: "texto" },
        { value: "amount", label: "Amount", type: "rango_dinero" },
        { value: "months_to_pay", label: "Months to Pay", type: "rango_dinero" },
        { value: "last_payment_date", label: "Last Payment Date", type: "rango_fechas" },
        { value: "user", label: "User ID", type: "texto" }, // Solo mostrar si `isAdmin` es true
      ];

    const options = allOptions.filter(option => {
        if (option.value === "user") {
            return isAdmin; 
        }
        return true;
    });
      

    const [filteredDebts, setFilteredDebts] = useState(debts);

    useEffect(() => {
        setFilteredDebts(debts);
    }, [debts]);

    const handleSearch = (searchTerm, selectedOption, minValue, maxValue, startDate, endDate) => {
        if (!selectedOption) {
          setFilteredDebts(debts);
          return;
        }
      
        let filtered = debts;
      

        const selectedType = options.find((opt) => opt.value === selectedOption)?.type;
      
        if (selectedType === "texto") {

          filtered = debts.filter((debt) =>
            debt[selectedOption]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else if (selectedType === "rango_dinero") {

          filtered = debts.filter(
            (debt) => debt[selectedOption] >= minValue && debt[selectedOption] <= maxValue
          );
        } else if (selectedType === "rango_fechas") {
        
          const start = new Date(startDate);
          const end = new Date(endDate);
          filtered = debts.filter((debt) => {
            const fieldDate = new Date(debt[selectedOption]);
            return fieldDate >= start && fieldDate <= end;
          });
        }
      
        setFilteredDebts(filtered);
      };
      

    return (
        <div className="limiter">

            <SearchBarWithFilter
                options ={options}
                onSearch={handleSearch}
            />

            <div className="container-table100">
                <div className="wrap-table100">
                    <div className="table">
                        {/* Header / Encabezado de la tabla */}
                        <div className="row header">
                            {isAdmin && ( <div className="cell">User_id</div>)}
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
                        {filteredDebts.length > 0 ? (
                            filteredDebts
                            .map((debt) => (
                                <div className="row" key={debt.id}>
                                    {isAdmin && (<div className="cell" data-title="User_id">{debt.user}</div>)}
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
