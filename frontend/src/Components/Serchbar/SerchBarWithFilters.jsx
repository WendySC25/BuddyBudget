// SearchBarWithFilter.jsx
import React, { useState } from 'react';
import './SearchBarWithFilter.css';

const SearchBarWithFilter = ({ options, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState(options[0]);

    const handleSearch = () => {
        onSearch({ searchTerm, selectedOption });
    };

    return (
        <div className="search-bar-container">
            <input
                type="text"
                className="search-input"
                placeholder="Serch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
                className="filter-select"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
            >
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <button className="search-button" onClick={handleSearch}>
                Buscar
            </button>
        </div>
    );
};

export default SearchBarWithFilter;