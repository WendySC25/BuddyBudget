import React, { useState } from 'react';
import '../Windows/Transactions.css';
import client from '../../apiClient.jsx';

const ConfigurationForm = ({ initialData, onSaveConfiguration }) => {
    const [sendTime, setSendTime] = useState(initialData?.send_time || '');
    const [addGraph, setAddGraph] = useState(initialData?.add_graph || false);
    const [sendAt, setSendAt] = useState(initialData?.send_at || '00:00:00');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            send_time: sendTime,
            add_graph: addGraph,
            send_at: sendAt,
        };

        try {
            await client.put('/api/configuration', data, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
            });
            setMessage('Configuration updated successfully!');
            setTimeout(() => setMessage(''), 3000);
            onSaveConfiguration();
        } catch (error) {
            console.error('Error updating configuration:', error);
            setMessage('Failed to update configuration');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="transaction-form">
                        <div className="transaction-field">
                            <label htmlFor="sendTime">Send Time</label>
                            <select
                                id="sendTime"
                                value={sendTime}
                                onChange={(e) => setSendTime(e.target.value)}
                            >
                                <option value="MON">Monthly</option>
                                <option value="WEK">Weekly</option>
                                <option value="FOR">Fortnight</option>
                                <option value="DAY">Daily</option>
                            </select>
                        </div>
                        <div className="transaction-field">
                            <label htmlFor="addGraph">Add Graph</label>
                            <input
                                type="checkbox"
                                id="addGraph"
                                checked={addGraph}
                                onChange={() => setAddGraph(!addGraph)}
                            />
                        </div>
                        <div className="transaction-field">
                            <label htmlFor="sendAt">Send At</label>
                            <input
                                type="time"
                                id="sendAt"
                                value={sendAt}
                                onChange={(e) => setSendAt(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit">Save Configuration</button>
                    <button type="button" onClick={onSaveConfiguration}>
                        Cancel
                    </button>
                    {message && <p className="message">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default ConfigurationForm;
