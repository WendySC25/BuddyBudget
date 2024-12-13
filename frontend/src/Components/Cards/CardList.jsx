<<<<<<< HEAD
//Categories.jsx
import React,{ useState, useEffect } from 'react';
import './CardList.css';
=======
import React, { useState, useEffect } from 'react';
import './CardList.css';
import SearchBarWithFilter from '../Serchbar/SerchBarWithFilters';
>>>>>>> df99701 (feat: Add serch bar into categories table)

const CardList = ({ categories, onEditCategory, onDeleteCategory }) => {
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const options = [
    { value: 'category_name', label: 'Category Name', type: 'texto' },
    { value: 'user', label: 'User ID', type: 'texto' },
    { value: 'type', label: 'Type', type: 'texto' },
  ];

  useEffect(() => {
    setFilteredCategories(categories);
}, [categories]);

  const handleSearch = (searchTerm, selectedOption) => {
    if (!selectedOption) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter((category) =>
      category[selectedOption]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCategories(filtered);
  };

  return (
    <div className="category-container">
      {/* SearchBarWithFilter */}
      <SearchBarWithFilter
        options={options}
        onSearch={handleSearch}
      />

      {/* Cards */}
      {filteredCategories.length > 0 ? (
        <div className="card-list">
          {filteredCategories.map((category, index) => (
            <article className="card" key={index}>
              <figure className="card-image" style={{ backgroundColor: category.color }} />

              <div className="card-header">
                {category.category_name}

                <div className="button-group">
                  <button onClick={() => onEditCategory(category)} className="icon-button">
                    <img
                      src="https://img.icons8.com/?size=100&id=AuMLFRmG95tQ&format=png&color=000000"
                      alt="Edit icon"
                    />
                  </button>
                  <button onClick={() => onDeleteCategory(category)} className="icon-button">
                    <img
                      src="https://img.icons8.com/?size=100&id=68064&format=png&color=000000"
                      alt="Trash can icon"
                    />
                  </button>
                </div>
              </div>

              <div className="card-footer">
                <div className="card-meta">User ID: {category.user}</div>
                <div className="card-meta">{category.type}</div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>No categories available</p>
      )}
    </div>
  );
};

export default CardList;
