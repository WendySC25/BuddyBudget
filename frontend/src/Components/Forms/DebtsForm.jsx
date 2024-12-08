// DebtsForm.jsx
import React, { useState, useEffect } from 'react';
import '../Windows/Transactions.css';
import client from '../../apiClient.jsx';

// Declaracion del componente DebtsForm, recibe la funcion onSaveDebt para ejecutar acciones cuando se guarde la deuda y contiene la deuda que se va a editar (si existe)
const DebtsForm = ({ onSaveDebt, debtToEdit }) => {
    const [description, setDescription] = useState('');
    const [creditor, setCreditor] = useState('');
    const [amount, setAmount] = useState('');
    const [monthsToPay, setMonthsToPay] = useState('');
    const [hasInterest, setHasInterest] = useState(false);
    const [lastPaymentDate, setLastPaymentDate] = useState('');
    const [message, setMessage] = useState('');

    // Si existe una deuda a editar, llena los estados con los valores correspondientes
    useEffect(() => {
        if (debtToEdit) {
            setDescription(debtToEdit.description);
            setCreditor(debtToEdit.creditor);
            setAmount(debtToEdit.amount);
            setMonthsToPay(debtToEdit.months_to_pay);
            setHasInterest(debtToEdit.has_interest);
            setLastPaymentDate(debtToEdit.last_payment_date);
        }
    }, [debtToEdit]);

    // Controla el envio del formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        // Datos que se enviaran 
        const data = {
            description,
            creditor,
            amount,
            months_to_pay: monthsToPay,
            has_interest: hasInterest,
            last_payment_date: lastPaymentDate,
        };

        // Si debtToEdit tiene valor se hace una solicitud para actualizar deuda
        if (debtToEdit) {
            const endpoint = `/api/debts/${debtToEdit.id}/`;
            client.put(endpoint, data)
                .then(() => {
                    setMessage('Debt updated successfully!');
                    setTimeout(() => setMessage(''), 3000);
                })
                .catch(error => {
                    console.error('Error updating debt:', error);
                    setMessage('Error updating debt');
                });
        } else {
            // Solicitud post para enviar una nueva deuda
            const endpoint = '/api/debts/';
            client.post(endpoint, data)
                .then(() => {
                    setMessage('Debt added successfully!');
                    setTimeout(() => setMessage(''), 3000);
                })
                .catch((error) => {
                    console.error('Error while creating debt:', error);
                    setMessage('Failed to add debt');
                });
        }

        setDescription('');
        setCreditor('');
        setAmount('');
        setMonthsToPay('');
        setHasInterest(false);
        setLastPaymentDate('');
        onSaveDebt();
        // Reinicia los estados y ejecuta onSaveDebt para actualizar la lista principal
    };

    // Renderizado
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="transaction-form">
                        <div className="transaction-field">
                            <label htmlFor="description">Description</label>
                            <input
                                type="text"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="transaction-field">
                            <label htmlFor="creditor">Creditor</label>
                            <input
                                type="text"
                                id="creditor"
                                value={creditor}
                                onChange={(e) => setCreditor(e.target.value)}
                                required
                            />
                        </div>
                        <div className="transaction-field">
                            <label htmlFor="amount">Amount</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="transaction-field">
                            <label htmlFor="monthsToPay">Months to Pay</label>
                            <input
                                type="number"
                                id="monthsToPay"
                                value={monthsToPay}
                                onChange={(e) => setMonthsToPay(e.target.value)}
                                required
                            />
                        </div>
                        <div className="transaction-field">
                            <label htmlFor="hasInterest">Has Interest</label>
                            <input
                                type="checkbox"
                                id="hasInterest"
                                checked={hasInterest}
                                onChange={() => setHasInterest(!hasInterest)}
                            />
                        </div>
                        <div className="transaction-field">
                            <label htmlFor="lastPaymentDate">Last Payment Date</label>
                            <input
                                type="date"
                                id="lastPaymentDate"
                                value={lastPaymentDate}
                                onChange={(e) => setLastPaymentDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit">{debtToEdit ? 'Update Debt' : 'Add Debt'}</button>
                    <button
                        type="button"
                        onClick={() => onSaveDebt()}
                    >
                        Cancel
                    </button>
                    {message && <p className="message">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default DebtsForm;
