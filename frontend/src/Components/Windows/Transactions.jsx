    // Transactions.jsx
    import React,{ useState, useEffect } from 'react';
    import Navbar from '../NavBar/Navbar';
    import TransactionsTable from '../Tables/TransactionsTable';
    import TransactionForm from '../Forms/TransactionForm.jsx';
    import CategoryForm from '../Forms/CategoryForm.jsx';
    import AccountForm from '../Forms/AccountForm.jsx';
    import './Transactions.css'
    import client from '../../apiClient.jsx';

    const Transactions = ({ handleLogout }) => {

        const [transactions, setTransactions] = useState([]);
        const [transactionToEdit, setTransactionToEdit] = useState(null);

        const [showForm, setShowForm]   = useState(false); 
        const [showFormC, setShowFormC] = useState(false); 
        const [showFormA, setShowFormA] = useState(false);         
       

        useEffect(() =>{ 
            fetchAllT();
            fetchPDF();
            const background = document.querySelector('.table-container');
            if (background) {
                if (showForm || showFormC) {
                    background.classList.add('blurred');
                } else {
                    background.classList.remove('blurred');
                }
            }

        }, [showForm, showFormC, showFormA]);

        const fetchAllT = async () => {
            const token = localStorage.getItem('authToken');
            try{
                const responseT = await client.get('/api/transactions', {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setTransactions(responseT.data);
                console.log('Fetched transaciones:', responseT.data);

            }catch(error){
                console.error('Error while fetching transactions', error);
            }
        };  

        const fetchPDF = async () => {
            const token = localStorage.getItem('authToken');
            try{
                const responseT = await client.get('/api/transactions_pdf', {
                    headers: {Authorization: `Bearer ${token}`},
                });
                console.log('Fetched doc:', responseT.data);

            }catch(error){
                console.error('Error while fetching doc', error);
            }
        };

        const handleSaveTransaction = () => {
            fetchAllT();
            setTransactionToEdit(null);
            setShowForm(false);  
        };

        const handleDeleteTransaction = (transactionToDelete) => {
            const endpoint = `/api/transactions/${transactionToDelete.id}/`;
            client.delete(endpoint)
            .then(
                //There is a bug here!  
               
            )
            .catch(error => {
                console.error('Error deleating transaction:', error);
            });
            fetchAllT()
            
        }

        const handleSaveCategory = () => {
            setShowFormC(false);  
        }

        const handleSaveAccount = () => {
            setShowFormA(false);
        }

        const handleEditTransaction = (transaction) => {
            setTransactionToEdit(transaction);
            setShowForm(true);
            fetchAllT();
        };

        const handleSaveEditTransaction = () => {
            setTransactionToEdit(null);
            setShowForm(false);
        };

    
        return (
            <div className="transaction">
                <Navbar handleLogout={handleLogout} />
                <h1>Transactions Page</h1>

                <div className="table-container">
                    <div className="table-header-buttons">
                        <button onClick={() => {setShowForm(!showForm);} }>
                            {showForm ? 'Cancel' : '+ Add Transaction'}
                        </button>

                        <button onClick={() => {setShowFormC(!showFormC);}}>
                            {showFormC ? 'Cancel' : '+ Add Category'}
                        </button>

                        <button onClick={() => setShowFormA(!showFormA)}>
                            {showFormA ? 'Cancel' : '+ Add Account'}
                        </button>
                        <button onClick={() => fetchPDF}>
                            {showFormA ? 'Cancel' : 'PDF'}
                        </button>
                    </div> 

                    <TransactionsTable
                        transactions={transactions}
                        onEditTransaction={handleEditTransaction}
                        onDeleteTransaction={handleDeleteTransaction}
                        onEdit={handleSaveEditTransaction}  
                    />
                </div>

                {showForm && <TransactionForm
                                onSaveTransaction={handleSaveTransaction}
                                transactionToEdit={transactionToEdit} 
                            />
                }

                {showFormC && <CategoryForm
                                onSaveCategory={handleSaveCategory}
                            />
                }

                {showFormA && <AccountForm
                                onSaveAccount={handleSaveAccount}
                            />}
            </div>
        );
    };

    export default Transactions;
