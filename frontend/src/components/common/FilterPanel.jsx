import React from 'react';
import { useFilters } from '../../context/FiltersContext';

const FilterPanel = ({ type }) => {
    const { productFilters, dishFilters, updateProductFilters, updateDishFilters } = useFilters();

    const productCategories = [
        'Замороженный', 'Мясной', 'Овощи', 'Зелень', 'Специи', 'Крупы', 'Консервы', 'Жидкость', 'Сладости'
    ];

    const dishCategories = [
        'Десерт', 'Первое', 'Второе', 'Напиток', 'Салат', 'Суп', 'Перекус'
    ];

    const flags = ['Веган', 'Без глютена', 'Без сахара'];

    const categories = type === 'product' ? productCategories : dishCategories;

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (type === 'product') {
            updateProductFilters({ category: value });
        } else {
            updateDishFilters({ category: value });
        }
    };

    const handleFlagChange = (flag) => {
        if (type === 'product') {
            const currentFlags = productFilters.flags;
            const newFlags = currentFlags.includes(flag)
                ? currentFlags.filter(f => f !== flag)
                : [...currentFlags, flag];
            updateProductFilters({ flags: newFlags });
        } else {
            const currentFlags = dishFilters.flags;
            const newFlags = currentFlags.includes(flag)
                ? currentFlags.filter(f => f !== flag)
                : [...currentFlags, flag];
            updateDishFilters({ flags: newFlags });
        }
    };

    const handleSortChange = (e) => {
        if (type === 'product') {
            const [sortBy, sortOrder] = e.target.value.split('-');
            updateProductFilters({ sortBy, sortOrder });
        }
    };

    const containerStyle = {
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        border: '1px solid #ddd',
    };

    const sectionStyle = {
        marginBottom: '15px',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
    };

    const selectStyle = {
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    };

    const checkboxGroupStyle = {
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
    };

    const checkboxStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    };

    return (
        <div style={containerStyle}>
            <div style={sectionStyle}>
                <label style={labelStyle}>Категория:</label>
                <select
                    onChange={handleCategoryChange}
                    value={type === 'product' ? productFilters.category : dishFilters.category}
                    style={selectStyle}
                >
                    <option value="">Все</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div style={sectionStyle}>
                <label style={labelStyle}>Флаги:</label>
                <div style={checkboxGroupStyle}>
                    {flags.map(flag => (
                        <label key={flag} style={checkboxStyle}>
                            <input
                                type="checkbox"
                                checked={(type === 'product' ? productFilters.flags : dishFilters.flags).includes(flag)}
                                onChange={() => handleFlagChange(flag)}
                            />
                            {flag}
                        </label>
                    ))}
                </div>
            </div>

            {type === 'product' && (
                <div style={sectionStyle}>
                    <label style={labelStyle}>Сортировка:</label>
                    <select
                        onChange={handleSortChange}
                        value={`${productFilters.sortBy}-${productFilters.sortOrder}`}
                        style={selectStyle}
                    >
                        <option value="name-asc">Название (А-Я)</option>
                        <option value="name-desc">Название (Я-А)</option>
                        <option value="calories-asc">Калорийность (по возрастанию)</option>
                        <option value="calories-desc">Калорийность (по убыванию)</option>
                        <option value="proteins-asc">Белки (по возрастанию)</option>
                        <option value="proteins-desc">Белки (по убыванию)</option>
                        <option value="fats-asc">Жиры (по возрастанию)</option>
                        <option value="fats-desc">Жиры (по убыванию)</option>
                        <option value="carbohydrates-asc">Углеводы (по возрастанию)</option>
                        <option value="carbohydrates-desc">Углеводы (по убыванию)</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default FilterPanel;