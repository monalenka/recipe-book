import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDish } from '../api/dishes';
import Header from '../components/common/Header';
import DishForm from '../components/dishes/DishForm';
import { useNotification } from '../context/NotificationContext';

const DishCreatePage = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await createDish(formData);
            showNotification('Блюдо создано', 'success');
            navigate('/dishes');
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
                <h1 style={titleStyle}>Создать блюдо</h1>
                <DishForm onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    );
};

export default DishCreatePage;