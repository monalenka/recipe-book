import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ImageUpload from '../common/ImageUpload';
import { getProducts } from '../../api/products';

const schema = yup.object({
    name: yup.string()
        .min(2, 'Минимум 2 символа')
        .required('Обязательное поле')
        .test('name-after-macro', 'Название после удаления макроса должно содержать минимум 2 символа', (value) => {
            if (!value) return false;
            const macroPattern = /^!?(десерт|первое|второе|напиток|салат|суп|перекус)\s*/i;
            const cleaned = value.replace(macroPattern, '').trim();
            return cleaned.length >= 2;
        }),
    serving_size: yup.number().min(0.01, 'Должно быть больше 0').required('Обязательное поле'),
    calories: yup.number().min(0).nullable(),
    proteins: yup.number().min(0).max(100, 'Не может превышать 100').nullable(),
    fats: yup.number().min(0).max(100, 'Не может превышать 100').nullable(),
    carbohydrates: yup.number().min(0).max(100, 'Не может превышать 100').nullable(),
    category: yup.string().nullable(),
    flags: yup.array().of(yup.string()),
    products: yup.array().of(
        yup.object({
            product_id: yup.number().positive('Выберите продукт').required('Выберите продукт'),
            quantity: yup.number().min(0.01, 'Количество должно быть больше 0').required('Укажите количество'),
        })
    ).min(1, 'Добавьте хотя бы один продукт')
        .test('all-products-valid', 'Все продукты должны быть выбраны и иметь количество > 0', (products) => {
            if (!products || products.length === 0) return false;
            return products.every(p => p.product_id && p.product_id > 0 && p.quantity > 0);
        }),
})

const DishForm = ({ initialData, onSubmit, loading }) => {
    const [images, setImages] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [serverError, setServerError] = useState('');
    const [manualNutrition, setManualNutrition] = useState(false);
    const [productsReady, setProductsReady] = useState(false);

    const { register, handleSubmit, setValue, watch, control, formState: { errors }, setError, clearErrors } = useForm({
        resolver: yupResolver(schema),
        defaultValues: initialData || {
            name: '',
            serving_size: 0,
            calories: null,
            proteins: null,
            fats: null,
            carbohydrates: null,
            category: '',
            flags: [],
            products: [{ product_id: '', quantity: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'products' });
    const flags = watch('flags', []);
    const products = watch('products');
    const servingSize = watch('serving_size');

    const recalculateNutrition = () => {
        if (!products || products.length === 0) return;
        if (availableProducts.length === 0) return;

        let totalCalories = 0, totalProteins = 0, totalFats = 0, totalCarbs = 0;

        for (const item of products) {
            const productId = Number(item.product_id);
            const quantity = Number(item.quantity);
            if (isNaN(productId) || productId <= 0) continue;
            if (isNaN(quantity) || quantity <= 0) continue;

            const product = availableProducts.find(p => p.id === productId);
            if (!product) continue;

            const factor = quantity / 100;
            totalCalories += (product.calories || 0) * factor;
            totalProteins += (product.proteins || 0) * factor;
            totalFats += (product.fats || 0) * factor;
            totalCarbs += (product.carbohydrates || 0) * factor;
        }

        setValue('calories', Math.round(totalCalories * 10) / 10);
        setValue('proteins', Math.round(totalProteins * 10) / 10);
        setValue('fats', Math.round(totalFats * 10) / 10);
        setValue('carbohydrates', Math.round(totalCarbs * 10) / 10);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts();
                setAvailableProducts(response.data);
                setProductsReady(true);
            } catch (err) {
                console.error(err);
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (manualNutrition) return;
        if (productsReady && products && products.length > 0) {
            recalculateNutrition();
        }
    }, [products, productsReady, manualNutrition]);

    useEffect(() => {
        if (initialData?.images) {
            setImages(initialData.images.map(img => img.image_url));
        }
        if (initialData?.products) {
            setValue('products', initialData.products.map(p => ({
                product_id: p.id,
                quantity: p.DishProduct?.quantity || 0,
            })));
        }
        if (initialData && (initialData.calories !== undefined || initialData.proteins !== undefined)) {
            setManualNutrition(true);
        }
    }, [initialData, setValue]);


    const handleFlagChange = (flag) => {
        const updated = flags.includes(flag) ? flags.filter(f => f !== flag) : [...flags, flag];
        setValue('flags', updated);
    };

    const handleNutritionChange = (field, value) => {
        setManualNutrition(true);
        setValue(field, parseFloat(value) || 0);
    };

    const handleAutoCalculate = () => {
        if (!productsReady) {
            alert('Список продуктов ещё загружается, попробуйте через секунду');
            return;
        }
        setManualNutrition(false);
        recalculateNutrition();
    };

    const processSubmit = async (data) => {
        setServerError('');

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('serving_size', data.serving_size);
        formData.append('calories', data.calories ?? 0);
        formData.append('proteins', data.proteins ?? 0);
        formData.append('fats', data.fats ?? 0);
        formData.append('carbohydrates', data.carbohydrates ?? 0);
        formData.append('category', data.category || '');
        formData.append('flags', JSON.stringify(data.flags));
        const productsData = data.products.map(p => ({ product_id: parseInt(p.product_id), quantity: parseFloat(p.quantity) }));
        formData.append('products', JSON.stringify(productsData));
        const existingImages = images.filter(img => typeof img === 'string');
        const newFiles = images.filter(img => img instanceof File);
        formData.append('existingImages', JSON.stringify(existingImages));
        newFiles.forEach(file => formData.append('images', file));
        try {
            await onSubmit(formData);
        } catch (err) {
            const msg = err.response?.data?.error || 'Ошибка сохранения';
            setServerError(msg);
            document.querySelector('.server-error')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const onFormSubmit = async (e) => {
        e.preventDefault();
        await handleSubmit(
            processSubmit,
            (validationErrors) => {
                let errorMessage = 'Пожалуйста, исправьте ошибки в форме';
                if (validationErrors.bzu?.message) {
                    errorMessage = validationErrors.bzu.message;
                } else if (validationErrors.products) {
                    errorMessage = 'Пожалуйста, заполните все продукты корректно';
                } else {
                    const firstError = Object.values(validationErrors)[0];
                    if (firstError?.message) errorMessage = firstError.message;
                }
                setServerError(errorMessage);
                const firstErrorField = Object.keys(validationErrors)[0];
                if (firstErrorField) {
                    const element = document.querySelector(`[name="${firstErrorField}"]`);
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        )();
    };

    const formStyle = { maxWidth: '100%', margin: '0 auto', backgroundColor: 'white', padding: '16px', borderRadius: '8px' };
    const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' };
    const errorStyle = { color: '#e74c3c', fontSize: '12px', marginTop: '5px' };
    const rowStyle = { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' };
    const halfFieldStyle = { flex: 1, minWidth: '180px' };
    const productRowStyle = { display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' };
    const productSelectStyle = { flex: 2, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' };
    const quantityInputStyle = { flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' };
    const blockStyle = { marginBottom: '12px' };

    return (
        <form onSubmit={onFormSubmit} style={formStyle}>
            {serverError && <div className="server-error" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #f5c6cb' }}>{serverError}</div>}

            <div style={rowStyle}>
                <div style={halfFieldStyle}>
                    <label>Название:</label>
                    <input {...register('name')} style={inputStyle} />
                    {errors.name && <div style={errorStyle}>{errors.name.message}</div>}
                    <small style={{ color: '#666' }}>!десерт, !первое, !второе, !напиток, !салат, !суп, !перекус</small>
                </div>
                <div style={halfFieldStyle}>
                    <label>Размер порции (г):</label>
                    <input type="number" step="0.1" {...register('serving_size')} style={inputStyle} />
                    {errors.serving_size && <div style={errorStyle}>{errors.serving_size.message}</div>}
                </div>
            </div>

            <div style={rowStyle}>
                <div style={halfFieldStyle}>
                    <label>Категория:</label>
                    <select {...register('category')} style={inputStyle}>
                        <option value="">Выберите (иначе будет определена из макроса)</option>
                        <option value="Десерт">Десерт</option>
                        <option value="Первое">Первое</option>
                        <option value="Второе">Второе</option>
                        <option value="Напиток">Напиток</option>
                        <option value="Салат">Салат</option>
                        <option value="Суп">Суп</option>
                        <option value="Перекус">Перекус</option>
                    </select>
                    {errors.category && <div style={errorStyle}>{errors.category.message}</div>}
                </div>
                <div style={halfFieldStyle}>
                    <label>Флаги:</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <label><input type="checkbox" checked={flags.includes('Веган')} onChange={() => handleFlagChange('Веган')} /> Веган</label>
                        <label><input type="checkbox" checked={flags.includes('Без глютена')} onChange={() => handleFlagChange('Без глютена')} /> Без глютена</label>
                        <label><input type="checkbox" checked={flags.includes('Без сахара')} onChange={() => handleFlagChange('Без сахара')} /> Без сахара</label>
                    </div>
                </div>
            </div>

            <div style={blockStyle}>
                <label>КБЖУ (рассчитывается автоматически, можно скорректировать):</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input type="number" step="0.1" placeholder="Калории" {...register('calories')} onChange={(e) => handleNutritionChange('calories', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <input type="number" step="0.1" placeholder="Белки" {...register('proteins')} onChange={(e) => handleNutritionChange('proteins', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <input type="number" step="0.1" placeholder="Жиры" {...register('fats')} onChange={(e) => handleNutritionChange('fats', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <input type="number" step="0.1" placeholder="Углеводы" {...register('carbohydrates')} onChange={(e) => handleNutritionChange('carbohydrates', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                </div>
                <small style={{ color: '#666' }}>Вы можете переопределить значения </small>
                <button type="button" onClick={handleAutoCalculate} style={{ marginTop: '5px', fontSize: '12px' }}>Рассчитать автоматически</button>
                {errors.bzu && <div style={errorStyle}>{errors.bzu.message}</div>}
            </div>

            <div style={blockStyle}>
                <label>Состав блюда:</label>
                {productsLoading ? (
                    <div>Загрузка продуктов...</div>
                ) : (
                    <>
                        {fields.map((field, index) => (
                            <div key={field.id} style={productRowStyle}>
                                <select {...register(`products.${index}.product_id`)} style={{ ...productSelectStyle, borderColor: errors.products?.[index]?.product_id ? '#e74c3c' : '#ddd' }}>
                                    <option value="">Выберите продукт</option>
                                    {availableProducts.map(product => (
                                        <option key={product.id} value={product.id}>{product.name}</option>
                                    ))}
                                </select>
                                <input type="number" step="0.1" placeholder="Количество (г)" {...register(`products.${index}.quantity`)} style={{ ...quantityInputStyle, borderColor: errors.products?.[index]?.quantity ? '#e74c3c' : '#ddd' }} />
                                <button type="button" onClick={() => remove(index)}>×</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => append({ product_id: '', quantity: 0 })}>+ Добавить продукт</button>
                        {errors.products && typeof errors.products.message === 'string' && <div style={errorStyle}>{errors.products.message}</div>}
                        {errors.products && Array.isArray(errors.products) && errors.products.map((err, idx) => (
                            <div key={idx} style={errorStyle}>
                                {err.product_id && <div>Продукт {idx + 1}: {err.product_id.message}</div>}
                                {err.quantity && <div>Количество {idx + 1}: {err.quantity.message}</div>}
                            </div>
                        ))}
                        {errors.products && !Array.isArray(errors.products) && typeof errors.products.message !== 'string' && (
                            <div style={errorStyle}>Пожалуйста, заполните все продукты корректно</div>
                        )}
                    </>
                )}
            </div>

            <div style={blockStyle}>
                <label>Фотографии (макс. 5):</label>
                <ImageUpload images={images} onImagesChange={setImages} max={5} />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '16px' }}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
        </form>
    );
};

export default DishForm;