//Categories.jsx
import React,{ useState, useEffect } from 'react';
import './CardList.css'


const CardList = ({categories, onEditCategory, onDeleteCategory}) => {
  
  return (
    categories.length > 0 ? (
      <div className="card-list">
        {categories.map((category, index) => (
          <article className="card" key={index}>
            <figure className="card-image" style={{ backgroundColor: category.color }} />
            
            <div className="card-header">
             {category.category_name} 
             
              <div className="button-group">
                <button onClick={() => onEditCategory(category)} className="icon-button">
                  <img
                    src="https://img.icons8.com/?size=100&id=AuMLFRmG95tQ&format=png&color=FFFFFF" 
                    alt="Edit icon"
                  />
                </button>
                <button onClick={() => onDeleteCategory(category)} className="icon-button">
                <img
                    src="https://img.icons8.com/?size=100&id=68064&format=png&color=FFFFFF" 
                    alt="Trash can icon "
                  />
                </button>
              </div>
            </div>

            <div className="card-footer">
             <div className='card-meta' > User ID: {category.user} </div>
             <div className='card-meta' > {category.type} </div>
            </div>

          </article>
        ))}
      </div>
    ) : (
      <p>No categories available</p> 
    )
  );
   
};

export default CardList;
