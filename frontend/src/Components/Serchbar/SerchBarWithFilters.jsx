import React, { useState } from "react";
import ReactSlider from "react-slider";
import "./SearchBarWithFilter.css";

const SearchBarWithFilter = ({ options, onSearch, handleReset, priceMin = 0, priceMax = 10000 }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [priceRange, setPriceRange] = useState([priceMin, priceMax]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  


  const handleSearch = () => {
    const minValue = priceRange[0];
    const maxValue = priceRange[1];
    onSearch(searchTerm, selectedOption, minValue, maxValue, startDate, endDate);
  };



  const renderDynamicInput = () => {
    const selectedType = options.find((opt) => opt.value === selectedOption)?.type;

    if(selectedType === "texto"){
        return(
            <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        );
    }

    if (selectedType === "rango_dinero") {
      return (
        <div className="price-range-container">
            ${priceRange[0]}
          
          <ReactSlider
            id="price-slider"
            className="custom-slider"
            thumbClassName="custom-thumb"
            trackClassName="custom-track"
            value={priceRange}
            min={priceMin}
            max={priceMax}
            step={50}
            onChange={(value) => setPriceRange(value)}
            withTracks
          />
          
          ${priceRange[1]}

        </div>
      );
    }

    if (selectedType === "rango_fechas") {
      return (
        <div className="date-range-container">
          <label>Start Date</label>
          <input
            type="date"
            className="date-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>End Date</label>
          <input
            type="date"
            className="date-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      );
    }

    return null; // Si no es rango de dinero ni rango de fechas, no muestra nada adicional
  };

  return (
    <div className="search-bar-container">

        <select
          className="filter-select"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="">Select Filter</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="search-button" onClick={handleSearch}>
          Serch
        </button>
   
      {renderDynamicInput()}
      
    </div>
  );
};

export default SearchBarWithFilter;
