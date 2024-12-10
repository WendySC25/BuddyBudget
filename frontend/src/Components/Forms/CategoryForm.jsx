// CategoryForm.jsx
import React, {useState, useEffect} from 'react';
import '../Windows/Transactions.css';
import client from '../../apiClient.jsx';

const CategoryForm = ({ onSaveCategory, categoryToEdit, isAdmin }) => {
    
    const [category_name,setCategory_name] = useState('');
    const [user_id, setUser] = useState(0);
    const [transactionType, setTransactionType] = useState('');
    const [category_color, setCategory_color] = useState("#ffffff");
    const [message, setMessage] = useState('');

    useEffect(() => {
        if(categoryToEdit){
            setCategory_name(categoryToEdit.category_name);
            setTransactionType(categoryToEdit.type)
            setCategory_color(categoryToEdit.color);
            setUser(categoryToEdit.user)
        }
    }, [categoryToEdit]);

    const handleSubmitC = (e) => { 
        e.preventDefault(); 

        const data = {
            user_id: user_id,

            category_name: category_name,
            type:          transactionType,
            color:         category_color,
        };

        if(categoryToEdit){
            const endpoint = `/api/categories/${categoryToEdit.id}/`;
            client.put(endpoint, data)
            .then(() => { })
            .catch((error) => {
                console.error('Error while updating category:', error.response?.data || error.message);
                setMessage('Failed to add category');
            });

        } else {
            const endpoint = '/api/categories/';
            client.post(endpoint,data)
            .then(() => {})
            .catch((error) => {
                console.error('Error while creating category:', error.response?.data || error.message);
                setMessage('Failed to add category');
            });

        }
        setCategory_name('');
        setCategory_color('#ffffff');   
        setMessage(`Category added successfully!`);
        setMessage('');
        onSaveCategory();
         
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
 
                <div className="transaction-type-buttons">
                    <button
                        type="button"
                        onClick={() => setTransactionType('INC')}
                        className={transactionType === 'INC' ? 'active-income' : ''}>
                        Income
                    </button>

                    <button
                        type="button"
                        onClick={() => setTransactionType('EXP')}
                        className={transactionType === 'EXP' ? 'active-expense' : ''}>
                        Expense
                    </button>
                </div>
 
                <div className={`transaction-form-container ${
                    transactionType ? 'show-form' : '' }`}>
                        {transactionType && ( <form onSubmit={handleSubmitC}>

                            <div className="transaction-form">

                                {isAdmin && (
                                    <div className="transaction-field">
                                        <label htmlFor="user id">User ID</label>
                                        <input
                                            type="number"
                                            id="user_id"
                                            value={user_id}
                                            onChange={(e) => setUser(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                                
                                <div className="transaction-field">
                                    <label htmlFor="name">Category name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={category_name}
                                            onChange={(e) => setCategory_name(e.target.value)}
                                            required
                                        />
                                </div>

                                <div className="transaction-field color-picker-field">
                                    <label htmlFor="color">Category Color</label>
                                        <div className="color-picker-container">
                                            <input
                                                type="color"
                                                id="color"
                                                value={category_color}
                                                onChange={(e) => setCategory_color(e.target.value)}
                                                className="color-picker"
                                            />
                                            <span className="color-preview" style={{ backgroundColor: category_color }}></span>
                                        </div>
                                </div>

                            </div>

                            <button type="submit">
                                {categoryToEdit ? 'Update Category' : 'Add Category'}
                            </button>

                            <button type="button" onClick={() =>  onSaveCategory()}>
                                Cancel
                            </button>

                            {message && <p className="message">{message}</p>}
                        </form>)}
                </div>
            </div>
        </div>

    );
}

export default CategoryForm;