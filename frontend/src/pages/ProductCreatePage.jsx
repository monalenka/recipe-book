import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../api/products';
import Header from '../components/common/Header';
import ProductForm from '../components/products/ProductForm';

const ProductCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await createProduct(formData);
            navigate('/products');
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка создания');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
    };

    return (
        <div>
            <Header />
            <div style={containerStyle}>
                <h1>Создать продукт</h1>
                <ProductForm onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    );
};

export default ProductCreatePage;