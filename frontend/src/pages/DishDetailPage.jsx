import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDishById, deleteDish } from '../api/dishes';
import Header from '../components/common/Header';
import { useNotification } from '../context/NotificationContext';

const DishDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [dish, setDish] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDish = async () => {
            try {
                const response = await getDishById(id);
                setDish(response.data);
            } catch (err) {
                setError('Блюдо не найдено');
            } finally {
                setLoading(false);
            }
        };
        fetchDish();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Удалить блюдо?')) {
            try {
                await deleteDish(id);
                showNotification('Блюдо удалено', 'success');
                navigate('/dishes');
            } catch (err) {
                showNotification(err.response?.data?.error || 'Ошибка удаления');
            }
        }
    };

    const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '20px' };
    const imageStyle = { width: '200px', height: '200px', objectFit: 'cover', borderRadius: '4px', margin: '5px' };
    const infoStyle = { marginBottom: '10px' };
    const buttonGroupStyle = { display: 'flex', gap: '10px', marginTop: '20px' };
    const productItemStyle = { marginLeft: '20px', marginBottom: '5px' };

    if (loading) return <div style={containerStyle}>Загрузка...</div>;
    if (error) return <div style={containerStyle}>{error}</div>;
    if (!dish) return <div style={containerStyle}>Блюдо не найдено</div>;

    return (
        <div>
            <Header />
            <div style={containerStyle}>
                <h1>{dish.name}</h1>
                <div>
                    {dish.images && dish.images.map(img => (
                        <img key={img.id} src={img.image_url} alt={dish.name} style={imageStyle} />
                    ))}
                </div>
                <div style={infoStyle}><strong>Калорийность:</strong> {dish.calories} ккал / порция</div>
                <div style={infoStyle}><strong>Белки:</strong> {dish.proteins} г, <strong>Жиры:</strong> {dish.fats} г, <strong>Углеводы:</strong> {dish.carbohydrates} г</div>
                <div style={infoStyle}><strong>Размер порции:</strong> {dish.serving_size} г</div>
                <div style={infoStyle}><strong>Категория:</strong> {dish.category}</div>
                <div style={infoStyle}><strong>Флаги:</strong> {dish.flags.join(', ') || 'нет'}</div>
                <div style={infoStyle}><strong>Дата создания:</strong> {new Date(dish.created_at).toLocaleString()}</div>
                <div style={infoStyle}><strong>Дата редактирования:</strong> {dish.updated_at ? new Date(dish.updated_at).toLocaleString() : '—'}</div>
                <div style={infoStyle}><strong>Состав:</strong></div>
                <div>
                    {dish.products && dish.products.map(product => (
                        <div key={product.id} style={productItemStyle}>
                            {product.name} - {product.DishProduct?.quantity} г
                        </div>
                    ))}
                </div>
                <div style={buttonGroupStyle}>
                    <Link to={`/dishes/${dish.id}/edit`}>Редактировать</Link>
                    <button onClick={handleDelete}>Удалить</button>
                    <Link to="/dishes">Назад к списку</Link>
                </div>
            </div>
        </div>
    );
};

export default DishDetailPage;