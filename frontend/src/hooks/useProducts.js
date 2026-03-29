import { useState, useEffect } from 'react';
import { getProducts } from '../api/products';

export const useProducts = (filters) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const params = {
                    ...filters,
                    flags: filters.flags?.join(','),
                };
                const response = await getProducts(params);
                setProducts(response.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.error || 'Ошибка загрузки продуктов');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [filters]);

    return { products, loading, error };
};