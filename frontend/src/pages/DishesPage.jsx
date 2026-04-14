import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FiltersContext';
import { getDishes, deleteDish } from '../api/dishes';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import DishCard from '../components/dishes/DishCard';
import { useNotification } from '../context/NotificationContext';

const DishesPage = () => {
    const { dishFilters } = useFilters();
    const { showNotification } = useNotification();
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchDishes = async () => {
        setLoading(true);
        try {
            const params = {
                ...dishFilters,
                flags: dishFilters.flags.join(','),
            };
            const response = await getDishes(params);
            setDishes(response.data);
        } catch (err) {
            setError('Ошибка загрузки блюд');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDishes();
    }, [dishFilters]);

    const handleDelete = async (id) => {
        try {
            await deleteDish(id);
            fetchDishes();
            showNotification('Блюдо удалено', 'success');
        } catch (err) {
            showNotification(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '20px' };
    const dishesGridStyle = { display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' };

    if (loading) return <div style={containerStyle}>Загрузка...</div>;
    if (error) return <div style={containerStyle}>{error}</div>;

    return (
        <div>
            <Header />
            <div style={containerStyle}>
                <h1>Блюда</h1>
                <SearchBar type="dish" />
                <FilterPanel type="dish" />
                <div style={dishesGridStyle}>
                    {dishes.map(dish => (
                        <DishCard key={dish.id} dish={dish} onDelete={handleDelete} />
                    ))}
                </div>
                {dishes.length === 0 && <p>Нет блюд</p>}
            </div>
        </div>
    );
};

export default DishesPage;