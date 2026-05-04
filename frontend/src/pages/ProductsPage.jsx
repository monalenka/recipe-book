import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FiltersContext';
import { getProducts, deleteProduct } from '../api/products';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import ProductCard from '../components/products/ProductCard';
import { useNotification } from '../context/NotificationContext';

const ProductsPage = () => {
    const { productFilters } = useFilters();
    const { showNotification } = useNotification();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                ...productFilters,
                flags: productFilters.flags.join(','),
            };
            const response = await getProducts(params);
            setProducts(response.data);
        } catch (err) {
            setError('Ошибка загрузки продуктов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [productFilters]);

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            fetchProducts();
            showNotification('Продукт удалён', 'success');
        } catch (err) {
            showNotification(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '20px' };
    const productsGridStyle = { display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' };

    if (loading) return <div style={containerStyle}>Загрузка...</div>;
    if (error) return <div style={containerStyle}>{error}</div>;

    return (
        <div>
            <Header />
            <div style={containerStyle}>
                <h1>Продукты</h1>
                <SearchBar type="product" />
                <FilterPanel type="product" />
                <div style={productsGridStyle}>
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} onDelete={handleDelete} />
                    ))}
                </div>
                {products.length === 0 && <p>Нет продуктов</p>}
            </div>
        </div>
    );
};

export default ProductsPage;