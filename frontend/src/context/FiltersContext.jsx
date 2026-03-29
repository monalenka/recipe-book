import React, { createContext, useState, useContext, useCallback } from 'react';

const FiltersContext = createContext();

export const FiltersProvider = ({ children }) => {
    const [productFilters, setProductFilters] = useState({
        search: '',
        category: '',
        preparation_status: '',
        flags: [],
        sortBy: 'name',
        sortOrder: 'asc',
    });

    const [dishFilters, setDishFilters] = useState({
        search: '',
        category: '',
        flags: [],
    });

    const updateProductFilters = useCallback((newFilters) => {
        setProductFilters((prev) => ({ ...prev, ...newFilters }));
    }, []);

    const updateDishFilters = useCallback((newFilters) => {
        setDishFilters((prev) => ({ ...prev, ...newFilters }));
    }, []);

    return (
        <FiltersContext.Provider
            value={{
                productFilters,
                dishFilters,
                updateProductFilters,
                updateDishFilters,
            }}
        >
            {children}
        </FiltersContext.Provider>
    );
};

export const useFilters = () => useContext(FiltersContext);