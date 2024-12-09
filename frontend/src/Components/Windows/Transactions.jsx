    // Transactions.jsx
    import React,{ useState, useEffect } from 'react';
    import Navbar from '../NavBar/Navbar';
    import TransactionsTable from '../Tables/TransactionsTable';
    import TransactionForm from '../Forms/TransactionForm.jsx';
    import CategoryForm from '../Forms/CategoryForm.jsx';
    import AccountForm from '../Forms/AccountForm.jsx';


    import './Transactions.css'
    import client from '../../apiClient.jsx';

    const Transactions = ({ handleLogout, isAdmin }) => {

        const [transactions, setTransactions] = useState([]);
        const [transactionToEdit, setTransactionToEdit] = useState(null);

        const [showForm, setShowForm]   = useState(false); 
        const [showFormC, setShowFormC] = useState(false); 
        const [showFormA, setShowFormA] = useState(false);         

        useEffect(() =>{ 
            fetchAllT();
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
            try {
              const responseT = await client.get('/api/transactions_pdf', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' 
              });

              const file = new Blob([responseT.data], { type: 'application/pdf' });

              const link = document.createElement('a');
              link.href = URL.createObjectURL(file);
              link.download = 'MyTransactions.pdf'; 
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (error) {
              console.error('Error while fetching doc', error);
            }
        };

        const handleSaveTransaction = () => {
            fetchAllT();
            setTransactionToEdit(null);
            setShowForm(false);  
        };

        const handleDeleteTransaction = async (transactionToDelete) => {
            const endpoint = `/api/transactions/${transactionToDelete.id}/`;
            try {
                await client.delete(endpoint, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
                });
                console.log(`Transaction with ID ${transactionToDelete.id} deleted successfully.`);
                // Elimina localmente la transacción del estado
                setTransactions((prevTransactions) =>
                    prevTransactions.filter((transaction) => transaction.id !== transactionToDelete.id)
                );
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        };


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
                        <button onClick={() => fetchPDF()}>
                            pdf:
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
                                isAdmin={isAdmin}
                            />
                }

                {showFormC && <CategoryForm
                                onSaveCategory={handleSaveCategory}
                                isAdmin={isAdmin}
                            />
                }

                {showFormA && <AccountForm
                                onSaveAccount={handleSaveAccount}
                                isAdmin={isAdmin}
                            />}
            </div>
        );
    };

    export default Transactions;
