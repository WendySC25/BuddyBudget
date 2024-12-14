import React, { useState } from 'react';
import '../Windows/Transactions.css';
import client from '../../apiClient.jsx';

const PdfForm = ({onSavePDF, isAdmin}) => {
    const [start_date, setStartDate] = useState('');
    const [end_date, setEndDate] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmitP = async (e) => {
        e.preventDefault();

        if (!start_date || !end_date) {
            setMessage('Please select both start and end dates.');
            return;
        }

        try {
            const token = sessionStorage.getItem('authToken');
            if (!token) {
                setMessage('User is not authenticated.');
                return;
            }

            const formattedStartDate = start_date;
            const formattedEndDate = end_date;

            const endpoint = isAdmin
            ? `/api/users_pdf?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
            : `/api/transactions_pdf?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;

            const responseT = await client.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const file = new Blob([responseT.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = isAdmin ? 'AdminTransactions.pdf' : `BuddyBudgetReport_${formattedStartDate}_${formattedEndDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setMessage('PDF generated successfully.');
        } catch (error) {
            console.error('Error while creating the PDF:', error);
            setMessage('An error occurred while generating the PDF.');
        }

    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmitP} className="transaction-form">
                    <div className="transaction-field">
                        <label htmlFor="start_date">Start Date:</label>
                        <input
                            type="date"
                            id="start_date"
                            value={start_date}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="transaction-field">
                        <label htmlFor="end_date">End Date:</label>
                        <input
                            type="date"
                            id="end_date"
                            value={end_date}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">
                        Generate PDF
                    </button>
                    <button
                        type="button"
                        onClick={() => onSavePDF()}
                    >
                        Cancel
                    </button>
                </form>
            
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default PdfForm;
