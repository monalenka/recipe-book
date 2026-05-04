import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ImageUpload from '../common/ImageUpload';

const schema = yup.object({
    name: yup.string().min(2, 'Минимум 2 символа').required('Обязательное поле'),
    calories: yup.number().min(0).required(),
    proteins: yup.number().min(0).max(100).required(),
    fats: yup.number().min(0).max(100).required(),
    carbohydrates: yup.number().min(0).max(100).required(),
    ingredients: yup.string().nullable(),
    category: yup.string().required(),
    preparation_status: yup.string().required(),
    flags: yup.array().of(yup.string()),
});

const ProductForm = ({ initialData, onSubmit, loading }) => {
    const [images, setImages] = useState([]);
    const [bzuError, setBzuError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: initialData || {
            name: '',
            calories: 0,
            proteins: 0,
            fats: 0,
            carbohydrates: 0,
            ingredients: '',
            category: '',
            preparation_status: '',
            flags: [],
        },
    });

    const flags = watch('flags', []);
    const proteins = watch('proteins', 0);
    const fats = watch('fats', 0);
    const carbs = watch('carbohydrates', 0);

    useEffect(() => {
        if (initialData?.images) {
            setImages(initialData.images.map(img => img.image_url));
        }
    }, [initialData]);

    useEffect(() => {
        if (bzuError) setBzuError('');
    }, [proteins, fats, carbs]);

    const handleFlagChange = (flag) => {
        const current = flags;
        const updated = current.includes(flag) ? current.filter(f => f !== flag) : [...current, flag];
        setValue('flags', updated);
    };

    const onSubmitForm = (data) => {
        setSubmitted(true);
        const sum = data.proteins + data.fats + data.carbohydrates;
        if (sum > 100) {
            setBzuError('Сумма белков, жиров и углеводов не может превышать 100');
            setTimeout(() => {
                document.querySelector('.bzu-error-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            return;
        }

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'flags') {
                formData.append(key, JSON.stringify(data[key]));
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        const existingImages = images.filter(img => typeof img === 'string');
        const newFiles = images.filter(img => img instanceof File);
        formData.append('existingImages', JSON.stringify(existingImages));
        newFiles.forEach(file => formData.append('images', file));
        onSubmit(formData);
    };

    const onError = () => {
        const firstError = document.querySelector('.error-message');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const formStyle = { maxWidth: '100%', margin: '0 auto', backgroundColor: 'white', padding: '16px', borderRadius: '8px' };
    const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' };
    const errorInputStyle = { ...inputStyle, borderColor: '#e74c3c', backgroundColor: '#fff5f5' };
    const errorStyle = { color: '#e74c3c', fontSize: '12px', marginTop: '5px' };
    const rowStyle = { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' };
    const halfFieldStyle = { flex: 1, minWidth: '180px' };
    const blockStyle = { marginBottom: '12px' };

    const showBzuHighlight = submitted && bzuError;

    return (
        <form onSubmit={handleSubmit(onSubmitForm, onError)} style={formStyle}>
            {bzuError && (
                <div className="bzu-error-block" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #f5c6cb' }}>
                    {bzuError}
                </div>
            )}

            <div style={rowStyle}>
                <div style={halfFieldStyle}>
                    <label>Название:</label>
                    <input {...register('name')} style={inputStyle} />
                    {errors.name && <div className="error-message" style={errorStyle}>{errors.name.message}</div>}
                </div>
                <div style={halfFieldStyle}>
                    <label>Калорийность (ккал/100г):</label>
                    <input type="number" step="0.1" {...register('calories')} style={inputStyle} />
                    {errors.calories && <div className="error-message" style={errorStyle}>{errors.calories.message}</div>}
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1, minWidth: '100px' }}>
                    <label>Белки:</label>
                    <input type="number" step="0.1" {...register('proteins')} style={showBzuHighlight ? errorInputStyle : inputStyle} />
                    {errors.proteins && <div className="error-message" style={errorStyle}>{errors.proteins.message}</div>}
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                    <label>Жиры:</label>
                    <input type="number" step="0.1" {...register('fats')} style={showBzuHighlight ? errorInputStyle : inputStyle} />
                    {errors.fats && <div className="error-message" style={errorStyle}>{errors.fats.message}</div>}
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                    <label>Углеводы:</label>
                    <input type="number" step="0.1" {...register('carbohydrates')} style={showBzuHighlight ? errorInputStyle : inputStyle} />
                    {errors.carbohydrates && <div className="error-message" style={errorStyle}>{errors.carbohydrates.message}</div>}
                </div>
                <div style={{ flex: 1, minWidth: '130px' }}>
                    <label>Категория:</label>
                    <select {...register('category')} style={inputStyle}>
                        <option value="">Выберите</option>
                        <option value="Замороженный">Замороженный</option>
                        <option value="Мясной">Мясной</option>
                        <option value="Овощи">Овощи</option>
                        <option value="Зелень">Зелень</option>
                        <option value="Специи">Специи</option>
                        <option value="Крупы">Крупы</option>
                        <option value="Консервы">Консервы</option>
                        <option value="Жидкость">Жидкость</option>
                        <option value="Сладости">Сладости</option>
                    </select>
                    {errors.category && <div className="error-message" style={errorStyle}>{errors.category.message}</div>}
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label>Нужна готовка?</label>
                    <select {...register('preparation_status')} style={inputStyle}>
                        <option value="">Выберите</option>
                        <option value="Готовый к употреблению">Готовый к употреблению</option>
                        <option value="Полуфабрикат">Полуфабрикат</option>
                        <option value="Требует приготовления">Требует приготовления</option>
                    </select>
                    {errors.preparation_status && <div className="error-message" style={errorStyle}>{errors.preparation_status.message}</div>}
                </div>
            </div>

            <div style={blockStyle}>
                <label>Состав (текст):</label>
                <textarea {...register('ingredients')} rows="2" style={inputStyle} />
            </div>

            <div style={blockStyle}>
                <label>Флаги:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <label><input type="checkbox" checked={flags.includes('Веган')} onChange={() => handleFlagChange('Веган')} /> Веган</label>
                    <label><input type="checkbox" checked={flags.includes('Без глютена')} onChange={() => handleFlagChange('Без глютена')} /> Без глютена</label>
                    <label><input type="checkbox" checked={flags.includes('Без сахара')} onChange={() => handleFlagChange('Без сахара')} /> Без сахара</label>
                </div>
            </div>

            <div style={blockStyle}>
                <label>Фотографии (макс. 5):</label>
                <ImageUpload images={images} onImagesChange={setImages} max={5} />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '16px' }}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
        </form>
    );
};

export default ProductForm;