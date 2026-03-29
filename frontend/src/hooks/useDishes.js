import { useState, useEffect } from 'react';
import { getDishes } from '../api/dishes';

export const useDishes = (filters) => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDishes = async () => {
            try {
                setLoading(true);
                const params = {
                    ...filters,
                    flags: filters.flags?.join(','),
                };
                const response = await getDishes(params);
                setDishes(response.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.error || 'Ошибка загрузки блюд');
            } finally {
                setLoading(false);
            }
        };
        fetchDishes();
    }, [filters]);

    return { dishes, loading, error };
};