import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../api/products';
import Header from '../components/common/Header';
import ProductForm from '../components/products/ProductForm';

const ProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await getProductById(id);
                setProduct(response.data);
            } catch (err) {
                alert('Ошибка загрузки продукта');
                navigate('/products');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await updateProduct(id, formData);
            navigate('/products');
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка обновления');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
    };

    if (fetchLoading) return <div style={containerStyle}>Загрузка...</div>;
    if (!product) return <div style={containerStyle}>Продукт не найден</div>;

    return (
        <div>
            <Header />
            <div style={containerStyle}>
                <h1>Редактировать продукт</h1>
                <ProductForm initialData={product} onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    );
};

export default ProductEditPage;