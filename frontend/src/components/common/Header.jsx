import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const headerStyle = {
        backgroundColor: '#4a90e2',
        padding: '15px 20px',
        marginBottom: '20px',
    };

    const navStyle = {
        display: 'flex',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    };

    const linkStyle = {
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
    };

    return (
        <header style={headerStyle}>
            <nav style={navStyle}>
                <Link to="/products" style={linkStyle}>Продукты</Link>
                <Link to="/dishes" style={linkStyle}>Блюда</Link>
                <Link to="/products/create" style={linkStyle}>Добавить продукт</Link>
                <Link to="/dishes/create" style={linkStyle}>Добавить блюдо</Link>
            </nav>
        </header>
    );
};

export default Header;