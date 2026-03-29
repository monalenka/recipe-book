import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDish } from '../api/dishes';
import Header from '../components/common/Header';
import DishForm from '../components/dishes/DishForm';

const DishCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await createDish(formData);
            navigate('/dishes');
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
                <h1>Создать блюдо</h1>
                <DishForm onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    );
};

export default DishCreatePage;