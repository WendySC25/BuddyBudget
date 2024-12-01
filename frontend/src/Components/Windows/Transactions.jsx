    // Transactions.jsx
    import React,{ useState, useEffect } from 'react';
    import Navbar from '../NavBar/Navbar';
    import TransactionsTable from '../Tables/TransactionsTable';
    import TransactionForm from '../Forms/TransactionForm.jsx';
    import CategoryForm from '../Forms/CategoryForm.jsx';
    import './Transactions.css'
    import axios from 'axios';
    import client from '../../apiClient.jsx';

    // Configuración de axios para solicitudes con CSRF
    axios.defaults.xsrfCookieName = 'csrftoken';
    axios.defaults.xsrfHeaderName = 'X-CSRFToken';
    axios.defaults.withCredentials = true;

    const Transactions = ({ handleLogout }) => {

        const [transactions, setTransactions] = useState([]); 
        
        const [showForm, setShowForm] = useState(false); 
        const [showFormC, setShowFormC] = useState(false); 
        const [showFormA, setShowFormA] = useState(false); 

        const [transactionType, setTransactionType] = useState('');
        const [account, setAccount] = useState([]); //array for options *they must come from db*
        const [amount, setAmount] = useState('');
        
        const [account_name,setAccount_name] = useState('');
        const [bank_name,setBank_name] = useState('');
        const [date, setDate] = useState('');
        const [message, setMessage] = useState('');
        
        const [transactionToEdit, setTransactionToEdit] = useState(null);


        //fetch transactions
        useEffect(() =>{ 
            fetchAllT();
            fetchAllA();

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

        const fetchAllA = async () => {
            try {   
                const responseA = await client.get('/api/accounts/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
                });
                setAccount(responseA.data);
                console.log('Fetched accounts:', responseA.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const handleSaveCategory = () => {
            setShowFormC(false);  
        }

        const handleSaveTransaction = () => {
            fetchAllT();
            setTransactionToEdit(null);
            setShowForm(false);  
        };

        const handleEditTransaction = (transaction) => {
            setTransactionToEdit(transaction);
            setShowForm(true);
            fetchAllT();
        };

        const handleEndEdit = () => {
            setTransactionToEdit(null);
            setShowForm(false);
        };

        const handleDeleteTransaction = (transactionToDelete) => {
            const endpoint = `/api/transactions/${transactionToDelete.id}/`;
            client.delete(endpoint)
            .then(()=> {
                setMessage(`${transactionType} deleted successfully!`); 
                setTimeout(() => setMessage(''), 3000);
                
            })
            .catch(error => {
                console.error('Error deleating transaction:', error);
                setMessage('Error deleating transaction');
            });
            fetchAllT();
            setShowForm(false);
        }
    
        //WHOLE FORM
        const handleSubmitA = (e) => { 
            e.preventDefault();  //THERES A BIG BUG IN HERE

            const data = {
            isAddingAccount: true, 
            account_name: account_name,
            bank_name: bank_name,
            amount: amount,
            date: date,
            };
            setAccount([...account, data]);

            const endpoint = '/api/accounts/';
            client.post(endpoint,data)
            .then(() => {
                setAccount_name('');
                setBank_name('');
                setAmount('');
                setDate('');
                setMessage(`Account added successfully!`);
                setShowFormA(false);
                setMessage('');
                fetchAllA();
            })
            .catch((error) => {
                console.error('Error while creating account:', error.response?.data || error.message);
                setMessage('Failed to add account');
            });
            
        };


        return (
            <div className="transaction">
            <Navbar handleLogout={handleLogout} />
            <h1>Transactions Page</h1>

            <div className="table-container">
                <div className="table-header-buttons">
                    <button onClick={() => {setTransactionType(''); setShowForm(!showForm);} }>
                        {showForm ? 'Cancel' : '+ Add Transaction'}
                    </button>

                    <button onClick={() => {setTransactionType(''); setShowFormC(!showFormC);}}>
                        {showFormC ? 'Cancel' : '+ Add Category'}
                    </button>

                    <button onClick={() => setShowFormA(!showFormA)}>
                        {showFormA ? 'Cancel' : '+ Add Account'}
                    </button>
                </div> 

                {/* Table */} 
                <TransactionsTable
                    transactions={transactions}
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onEdit={handleEndEdit}  
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

            {showFormA && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <form onSubmit={handleSubmitA}>
                                <div className="transaction-form">
                                    <div className="transaction-field">
                                        <label htmlFor="name">Account Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={account_name}
                                            onChange={(e) => setAccount_name(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="transaction-field">
                                        <label htmlFor="name">Bank</label>
                                        <input
                                            type="text"
                                            id="bank"
                                            value={bank_name}
                                            onChange={(e) => setBank_name(e.target.value)}
                                            
                                        />
                                    </div>
                                    <div className="transaction-field">
                                        <label htmlFor="amount">Account number</label>
                                        <input
                                            type="number"
                                            id="amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            
                                        />
                                    </div>
                                    <div className="transaction-field">
                                        <label htmlFor="date">Expiring Date</label>
                                        <input
                                            type="date"
                                            id="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit">Add Account</button>
                                <button
                                    type="button"
                                    onClick={() => setShowFormA(!showFormA)}
                                >
                                    Cancel
                                </button>
                                {message && <p className="message">{message}</p>}
                            </form>
                        </div>
                    </div>
            )}
  
            </div>
        );
    };

    export default Transactions;
