// // CategoryForm.jsx
// import React,{ useState, useEffect } from 'react';
// import '../Windows/Transactions.css';
// import axios from 'axios';
// import client from '../../apiClient.jsx';

// axios.defaults.xsrfCookieName = 'csrftoken';
// axios.defaults.xsrfHeaderName = 'X-CSRFToken';
// axios.defaults.withCredentials = true;

// const CategoryForm = ({ onSaveCategory }) => {


// <div className="modal-overlay">
//                         <div className="modal-content">
//                             <div className="transaction-type-buttons">
//                                 <button
//                                     type="button"
//                                     onClick={() => setTransactionType('INC')}
//                                     className={transactionType === 'INC' ? 'active-income' : ''}
//                                 >
//                                     Income
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => setTransactionType('EXP')}
//                                     className={transactionType === 'EXP' ? 'active-expense' : ''}
//                                 >
//                                     Expense
//                                 </button>
//                             </div>
 
//                             <div
//                             className={`transaction-form-container ${
//                                 transactionType ? 'show-form' : ''
//                             }`}
//                             >
//                             {transactionType && ( <form onSubmit={handleSubmitC}>
//                                 <div className="transaction-form">
//                                     <div className="transaction-field">
//                                         <label htmlFor="name">Category name</label>
//                                         <input
//                                             type="text"
//                                             id="name"
//                                             value={category_name}
//                                             onChange={(e) => setCategory_name(e.target.value)}
//                                             required
//                                         />
//                                     </div>

//                                      {/* Color Picker */}
//                                      <div className="transaction-field color-picker-field">
//                                         <label htmlFor="color">Category Color</label>
//                                         <div className="color-picker-container">
//                                             <input
//                                                 type="color"
//                                                 id="color"
//                                                 value={category_color} // State variable for color
//                                                 onChange={(e) => setCategory_color(e.target.value)}
//                                                 className="color-picker"
//                                             />
//                                             <span className="color-preview" style={{ backgroundColor: category_color }}></span>
//                                         </div>
//                                     </div>

//                                 </div>
//                                 <button type="submit">Add Category</button>
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowFormC(!showFormC)}
//                                 >
//                                     Cancel
//                                 </button>
//                                 {message && <p className="message">{message}</p>}
//                             </form>)}
//                             </div>
//                         </div>
//                     </div>