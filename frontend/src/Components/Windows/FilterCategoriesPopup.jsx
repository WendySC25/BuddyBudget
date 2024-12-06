import React, { useState } from 'react';
import './FilterCategoriesPopup.css';

const FilterCategoriesPopup = ({ categories, onCancel, onSave, onClear }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Filter Categories</h2>
        <ul className="categories-container">
          {categories.map((category) => (
            <li key={category}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                {category}
              </label>
            </li>
          ))}
        </ul>
        <div className="popup-buttons">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={() => onSave(selectedCategories)}>Save Filters</button>
          <button onClick={onClear}>Clean Filters</button>
        </div>
      </div>
    </div>
  );
};

export default FilterCategoriesPopup;



