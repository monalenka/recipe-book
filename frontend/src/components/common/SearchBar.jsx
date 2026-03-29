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

    const handleSearch = (e) => {
        const value = e.target.value;
        setLocalSearch(value);
        if (type === 'product') {
            updateProductFilters({ search: value });
        } else {
            updateDishFilters({ search: value });
        }
    };

    const containerStyle = {
        marginBottom: '20px',
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    };

    return (
        <div style={containerStyle}>
            <input
                type="text"
                placeholder="Поиск..."
                value={localSearch}
                onChange={handleSearch}
                style={inputStyle}
            />
        </div>
    );
};

export default SearchBar;