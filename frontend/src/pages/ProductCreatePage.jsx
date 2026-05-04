import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../api/products';
import Header from '../components/common/Header';
import ProductForm from '../components/products/ProductForm';
import { useNotification } from '../context/NotificationContext';

const ProductCreatePage = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await createProduct(formData);
            showNotification('Продукт создан', 'success');
            navigate('/products');
        } catch (err) {
            showNotification(err.response?.data?.error || 'Ошибка создания');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '16px 20px',
    };

    const titleStyle = {
        marginTop: 0,
        marginBottom: '16px',
        fontSize: '1.75rem',
    };

    return (
        <div>
            <Header />
            <div style={containerStyle}>
                <h1 style={titleStyle}>Создать продукт</h1>
                <ProductForm onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    );
};

export default ProductCreatePage;