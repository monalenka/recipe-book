import React from 'react';
import { Link } from 'react-router-dom';

const DishCard = ({ dish, onDelete }) => {
    const mainImage = dish.images && dish.images[0] ? dish.images[0].image_url : null;

    const cardStyle = {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        width: '250px',
        backgroundColor: 'white',
        transition: 'box-shadow 0.3s',
    };

    const imageStyle = {
        width: '100%',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '10px',
    };

    const titleStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '10px',
    };

    const infoStyle = {
        fontSize: '14px',
        color: '#666',
        marginBottom: '5px',
    };

    const buttonGroupStyle = {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
    };

    const deleteButtonStyle = {
        backgroundColor: '#e74c3c',
    };

    return (
        <div style={cardStyle}>
            {mainImage && <img src={mainImage} alt={dish.name} style={imageStyle} />}
            <h3 style={titleStyle}>{dish.name}</h3>
            <p style={infoStyle}>Калорийность: {dish.calories} ккал / порция</p>
            <p style={infoStyle}>Белки: {dish.proteins}г / Жиры: {dish.fats}г / Углеводы: {dish.carbohydrates}г</p>
            <p style={infoStyle}>Размер порции: {dish.serving_size}г</p>
            <p style={infoStyle}>Категория: {dish.category}</p>
            <p style={infoStyle}>Флаги: {dish.flags.join(', ') || 'нет'}</p>
            <div style={buttonGroupStyle}>
                <Link to={`/dishes/${dish.id}`}>Подробнее</Link>
                <Link to={`/dishes/${dish.id}/edit`}>Редактировать</Link>
                <button onClick={() => onDelete(dish.id)} style={deleteButtonStyle}>Удалить</button>
            </div>
        </div>
    );
};

export default DishCard;