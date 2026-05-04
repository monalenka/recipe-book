import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, deleteProduct } from '../api/products';
import Header from '../components/common/Header';
import { useNotification } from '../context/NotificationContext';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await getProductById(id);
                setProduct(response.data);
            } catch (err) {
                setError('Продукт не найден');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Удалить продукт?')) {
            try {
                await deleteProduct(id);
                showNotification('Продукт удалён', 'success');
                navigate('/products');
            } catch (err) {
                showNotification(err.response?.data?.error || 'Ошибка удаления');
            }
        }
    };

    const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '20px' };
    const imageStyle = { width: '200px', height: '200px', objectFit: 'cover', borderRadius: '4px', margin: '5px' };
    const infoStyle = { marginBottom: '10px' };
    const buttonGroupStyle = { display: 'flex', gap: '10px', marginTop: '20px' };

    if (loading) return <div style={containerStyle}>Загрузка...</div>;
    if (error) return <div style={containerStyle}>{error}</div>;
    if (!product) return <div style={containerStyle}>Продукт не найден</div>;

    return (
        <div>
            <Header />
            <div style={containerStyle}>
                <h1>{product.name}</h1>
                <div>
                    {product.images && product.images.map(img => (
                        <img key={img.id} src={img.image_url} alt={product.name} style={imageStyle} />
                    ))}
                </div>
                <div style={infoStyle}><strong>Калорийность:</strong> {product.calories} ккал / 100г</div>
                <div style={infoStyle}><strong>Белки:</strong> {product.proteins} г, <strong>Жиры:</strong> {product.fats} г, <strong>Углеводы:</strong> {product.carbohydrates} г</div>
                <div style={infoStyle}><strong>Состав:</strong> {product.ingredients || 'не указан'}</div>
                <div style={infoStyle}><strong>Категория:</strong> {product.category}</div>
                <div style={infoStyle}><strong>Необходимость готовки:</strong> {product.preparation_status}</div>
                <div style={infoStyle}><strong>Флаги:</strong> {product.flags.join(', ') || 'нет'}</div>
                <div style={infoStyle}><strong>Дата создания:</strong> {new Date(product.created_at).toLocaleString()}</div>
                <div style={infoStyle}><strong>Дата редактирования:</strong> {product.updated_at ? new Date(product.updated_at).toLocaleString() : '—'}</div>
                <div style={buttonGroupStyle}>
                    <Link to={`/products/${product.id}/edit`}>Редактировать</Link>
                    <button onClick={handleDelete}>Удалить</button>
                    <Link to="/products">Назад к списку</Link>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;