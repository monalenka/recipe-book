import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDishById, updateDish } from '../api/dishes';
import Header from '../components/common/Header';
import DishForm from '../components/dishes/DishForm';
import { useNotification } from '../context/NotificationContext';

const DishEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [dish, setDish] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        const fetchDish = async () => {
            try {
                const response = await getDishById(id);
                setDish(response.data);
            } catch (err) {
                showNotification('Ошибка загрузки блюда');
                navigate('/dishes');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchDish();
    }, [id, navigate, showNotification]);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await updateDish(id, formData);
            showNotification('Блюдо обновлено', 'success');
            navigate('/dishes');
        } catch (err) {
            showNotification(err.response?.data?.error || 'Ошибка обновления');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '20px' };

    if (fetchLoading) return <div style={containerStyle}>Загрузка...</div>;
    if (!dish) return <div style={containerStyle}>Блюдо не найдено</div>;

    return (
        <div>
            <Header />
            <div style={containerStyle}>
                <h1>Редактировать блюдо</h1>
                <DishForm initialData={dish} onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    );
};

export default DishEditPage;