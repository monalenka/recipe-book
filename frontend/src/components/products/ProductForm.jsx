import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ImageUpload from '../common/ImageUpload';

const schema = yup.object({
    name: yup.string().min(2, 'Минимум 2 символа').required('Обязательное поле'),
    calories: yup.number().min(0, 'Не может быть отрицательным').required('Обязательное поле'),
    proteins: yup.number().min(0, 'Не может быть отрицательным').max(100, 'Не может превышать 100').required('Обязательное поле'),
    fats: yup.number().min(0, 'Не может быть отрицательным').max(100, 'Не может превышать 100').required('Обязательное поле'),
    carbohydrates: yup.number().min(0, 'Не может быть отрицательным').max(100, 'Не может превышать 100').required('Обязательное поле'),
    ingredients: yup.string().nullable(),
    category: yup.string().required('Выберите категорию'),
    preparation_status: yup.string().required('Выберите статус'),
    flags: yup.array().of(yup.string()),
}).test('bzu-sum', 'Сумма белков, жиров и углеводов не может превышать 100', (values) => {
    const sum = (values.proteins || 0) + (values.fats || 0) + (values.carbohydrates || 0);
    return sum <= 100;
});

const ProductForm = ({ initialData, onSubmit, loading }) => {
    const [images, setImages] = useState([]);
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

    useEffect(() => {
        if (initialData?.images) {
            setImages(initialData.images.map(img => img.image_url));
        }
    }, [initialData]);

    const handleFlagChange = (flag) => {
        const current = flags;
        const updated = current.includes(flag)
            ? current.filter(f => f !== flag)
            : [...current, flag];
        setValue('flags', updated);
    };

    const onSubmitForm = (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'flags') {
                formData.append(key, JSON.stringify(data[key]));
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        images.forEach(img => {
            if (img instanceof File) {
                formData.append('images', img);
            }
        });
        onSubmit(formData);
    };

    const formStyle = {
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
    };

    const inputStyle = {
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    };

    const errorStyle = {
        color: '#e74c3c',
        fontSize: '12px',
        marginTop: '5px',
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} style={formStyle}>
            <div>
                <label>Название:</label>
                <input {...register('name')} style={inputStyle} />
                {errors.name && <div style={errorStyle}>{errors.name.message}</div>}
            </div>

            <div>
                <label>Калорийность (ккал/100г):</label>
                <input type="number" step="0.1" {...register('calories')} style={inputStyle} />
                {errors.calories && <div style={errorStyle}>{errors.calories.message}</div>}
            </div>

            <div>
                <label>Белки (г/100г):</label>
                <input type="number" step="0.1" {...register('proteins')} style={inputStyle} />
                {errors.proteins && <div style={errorStyle}>{errors.proteins.message}</div>}
            </div>

            <div>
                <label>Жиры (г/100г):</label>
                <input type="number" step="0.1" {...register('fats')} style={inputStyle} />
                {errors.fats && <div style={errorStyle}>{errors.fats.message}</div>}
            </div>

            <div>
                <label>Углеводы (г/100г):</label>
                <input type="number" step="0.1" {...register('carbohydrates')} style={inputStyle} />
                {errors.carbohydrates && <div style={errorStyle}>{errors.carbohydrates.message}</div>}
            </div>

            <div>
                <label>Состав (текст):</label>
                <textarea {...register('ingredients')} rows="3" style={inputStyle} />
            </div>

            <div>
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
                {errors.category && <div style={errorStyle}>{errors.category.message}</div>}
            </div>

            <div>
                <label>Необходимость готовки:</label>
                <select {...register('preparation_status')} style={inputStyle}>
                    <option value="">Выберите</option>
                    <option value="Готовый к употреблению">Готовый к употреблению</option>
                    <option value="Полуфабрикат">Полуфабрикат</option>
                    <option value="Требует приготовления">Требует приготовления</option>
                </select>
                {errors.preparation_status && <div style={errorStyle}>{errors.preparation_status.message}</div>}
            </div>

            <div>
                <label>Флаги:</label>
                <div>
                    <label><input type="checkbox" checked={flags.includes('Веган')} onChange={() => handleFlagChange('Веган')} /> Веган</label>
                    <label style={{ marginLeft: '10px' }}><input type="checkbox" checked={flags.includes('Без глютена')} onChange={() => handleFlagChange('Без глютена')} /> Без глютена</label>
                    <label style={{ marginLeft: '10px' }}><input type="checkbox" checked={flags.includes('Без сахара')} onChange={() => handleFlagChange('Без сахара')} /> Без сахара</label>
                </div>
            </div>

            <div>
                <label>Фотографии (макс. 5):</label>
                <ImageUpload images={images} onImagesChange={setImages} max={5} />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '20px' }}>
                {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
        </form>
    );
};

export default ProductForm;