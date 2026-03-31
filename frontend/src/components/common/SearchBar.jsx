import React, { useState, useEffect } from 'react';
import { useFilters } from '../../context/FiltersContext';

const SearchBar = ({ type }) => {
    const { productFilters, dishFilters, updateProductFilters, updateDishFilters } = useFilters();
    const [localSearch, setLocalSearch] = useState('');

    useEffect(() => {
        if (type === 'product') {
            setLocalSearch(productFilters.search);
        } else {
            setLocalSearch(dishFilters.search);
        }
    }, [type, productFilters.search, dishFilters.search]);

    const handleInputChange = (e) => {
        setLocalSearch(e.target.value);
    };

    const handleSearchClick = () => {
        if (type === 'product') {
            updateProductFilters({ search: localSearch });
        } else {
            updateDishFilters({ search: localSearch });
        }
    };

    const handleClearClick = () => {
        setLocalSearch('');
        if (type === 'product') {
            updateProductFilters({ search: '' });
        } else {
            updateDishFilters({ search: '' });
        }
    };

    const containerStyle = {
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
    };

    const inputStyle = {
        flex: 1,
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    };

    const buttonStyle = {
        padding: '10px 20px',
        backgroundColor: '#4a90e2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    };

    const clearButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#6c757d',
    };

    return (
        <div style={containerStyle}>
            <input
                type="text"
                placeholder="Поиск..."
                value={localSearch}
                onChange={handleInputChange}
                style={inputStyle}
            />
            <button onClick={handleSearchClick} style={buttonStyle}>
                Найти
            </button>
            <button onClick={handleClearClick} style={clearButtonStyle}>
                Сбросить
            </button>
        </div>
    );
};

export default SearchBar;