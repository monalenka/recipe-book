import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onDelete }) => {
    const mainImage = product.images && product.images[0] ? product.images[0].image_url : null;

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
            {mainImage && <img src={mainImage} alt={product.name} style={imageStyle} />}
            <h3 style={titleStyle}>{product.name}</h3>
            <p style={infoStyle}>Калорийность: {product.calories} ккал / 100г</p>
            <p style={infoStyle}>Белки: {product.proteins}г / Жиры: {product.fats}г / Углеводы: {product.carbohydrates}г</p>
            <p style={infoStyle}>Категория: {product.category}</p>
            <p style={infoStyle}>Флаги: {product.flags.join(', ') || 'нет'}</p>
            <div style={buttonGroupStyle}>
                <Link to={`/products/${product.id}`}>Подробнее</Link>
                <Link to={`/products/${product.id}/edit`}>Редактировать</Link>
                <button onClick={() => onDelete(product.id)} style={deleteButtonStyle}>Удалить</button>
            </div>
        </div>
    );
};

export default ProductCard;