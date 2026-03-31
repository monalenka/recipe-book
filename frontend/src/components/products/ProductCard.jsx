import React from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_IMAGE } from '../../utils/constants';

const ProductCard = ({ product, onDelete }) => {
    const mainImage = product.images && product.images.length > 0
        ? product.images[0].image_url
        : DEFAULT_IMAGE;

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
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '10px',
    };

    const linkButtonStyle = {
        padding: '6px 12px',
        backgroundColor: '#4a90e2',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        textAlign: 'center',
        flex: '1 0 auto',
    };

    const deleteButtonStyle = {
        padding: '6px 12px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        flex: '1 0 auto',
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
                <Link to={`/products/${product.id}`} style={linkButtonStyle}>Подробнее</Link>
                <Link to={`/products/${product.id}/edit`} style={linkButtonStyle}>Редактировать</Link>
                <button onClick={() => onDelete(product.id)} style={deleteButtonStyle}>Удалить</button>
            </div>
        </div>
    );
};

export default ProductCard;