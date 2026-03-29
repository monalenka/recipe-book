import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ImageUpload from '../common/ImageUpload';
import { getProducts } from '../../api/products';

const schema = yup.object({
    name: yup.string().min(2, 'Минимум 2 символа').required('Обязательное поле'),
    serving_size: yup.number().min(0.01, 'Должно быть больше 0').required('Обязательное поле'),
    calories: yup.number().min(0).nullable(),
    proteins: yup.number().min(0).max(100, 'Не может превышать 100').nullable(),
    fats: yup.number().min(0).max(100, 'Не может превышать 100').nullable(),
    carbohydrates: yup.number().min(0).max(100, 'Не может превышать 100').nullable(),
    category: yup.string().required('Выберите категорию'),
    flags: yup.array().of(yup.string()),
    products: yup.array().of(
        yup.object({
            product_id: yup.number().required('Выберите продукт'),
            quantity: yup.number().min(0.01, 'Количество должно быть больше 0').required('Обязательное поле'),
        })
    ).min(1, 'Добавьте хотя бы один продукт'),
}).test('bzu-per-100g', 'Сумма белков, жиров и углеводов в пересчёте на 100 г не может превышать 100', (values) => {
    const { proteins, fats, carbohydrates, serving_size } = values;
    if (proteins === undefined || fats === undefined || carbohydrates === undefined) {
        return true;
    }
    if (!serving_size || serving_size <= 0) return true;
    const totalPer100g = ((proteins + fats + carbohydrates) / serving_size) * 100;
    return totalPer100g <= 100;
});

const DishForm = ({ initialData, onSubmit, loading }) => {
    const [images, setImages] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm({
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'products',
    });

    const flags = watch('flags', []);
    const products = watch('products', []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts();
                setAvailableProducts(response.data);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, []);

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
    }, [initialData, setValue]);

    const handleFlagChange = (flag) => {
        const current = flags;
        const updated = current.includes(flag)
            ? current.filter(f => f !== flag)
            : [...current, flag];
        setValue('flags', updated);
    };

    const onSubmitForm = (data) => {
        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('serving_size', data.serving_size);
        if (data.calories) formData.append('calories', data.calories);
        if (data.proteins) formData.append('proteins', data.proteins);
        if (data.fats) formData.append('fats', data.fats);
        if (data.carbohydrates) formData.append('carbohydrates', data.carbohydrates);
        formData.append('category', data.category);
        formData.append('flags', JSON.stringify(data.flags));

        const productsData = data.products.map(p => ({
            product_id: parseInt(p.product_id),
            quantity: parseFloat(p.quantity)
        }));
        formData.append('products', JSON.stringify(productsData));

        images.forEach(img => {
            if (img instanceof File) {
                formData.append('images', img);
            }
        });

        onSubmit(formData);
    };

    const formStyle = {
        maxWidth: '800px',
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

    const productRowStyle = {
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
        alignItems: 'center',
    };

    const productSelectStyle = {
        flex: 2,
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    };

    const quantityInputStyle = {
        flex: 1,
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} style={formStyle}>
            <div>
                <label>Название:</label>
                <input {...register('name')} style={inputStyle} />
                {errors.name && <div style={errorStyle}>{errors.name.message}</div>}
                <small style={{ color: '#666' }}>Можно использовать макросы: !десерт, !первое, !второе, !напиток, !салат, !суп, !перекус</small>
            </div>

            <div>
                <label>Размер порции (г):</label>
                <input type="number" step="0.1" {...register('serving_size')} style={inputStyle} />
                {errors.serving_size && <div style={errorStyle}>{errors.serving_size.message}</div>}
            </div>

            <div>
                <label>Категория:</label>
                <select {...register('category')} style={inputStyle}>
                    <option value="">Выберите</option>
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

            <div>
                <label>КБЖУ (опционально, для ручной корректировки):</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" step="0.1" placeholder="Калории" {...register('calories')} style={inputStyle} />
                    <input type="number" step="0.1" placeholder="Белки" {...register('proteins')} style={inputStyle} />
                    <input type="number" step="0.1" placeholder="Жиры" {...register('fats')} style={inputStyle} />
                    <input type="number" step="0.1" placeholder="Углеводы" {...register('carbohydrates')} style={inputStyle} />
                </div>
                <small style={{ color: '#666' }}>Если не заполнены, будут рассчитаны автоматически</small>
                {errors.proteins && <div style={errorStyle}>{errors.proteins.message}</div>}
                {errors.fats && <div style={errorStyle}>{errors.fats.message}</div>}
                {errors.carbohydrates && <div style={errorStyle}>{errors.carbohydrates.message}</div>}
                {errors.bzuPer100g && <div style={errorStyle}>{errors.bzuPer100g.message}</div>}
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
                <label>Состав блюда:</label>
                {productsLoading ? (
                    <div>Загрузка продуктов...</div>
                ) : (
                    <>
                        {fields.map((field, index) => (
                            <div key={field.id} style={productRowStyle}>
                                <select
                                    {...register(`products.${index}.product_id`)}
                                    style={productSelectStyle}
                                >
                                    <option value="">Выберите продукт</option>
                                    {availableProducts.map(product => (
                                        <option key={product.id} value={product.id}>{product.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Количество (г)"
                                    {...register(`products.${index}.quantity`)}
                                    style={quantityInputStyle}
                                />
                                <button type="button" onClick={() => remove(index)}>×</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => append({ product_id: '', quantity: 0 })}>
                            + Добавить продукт
                        </button>
                        {errors.products && <div style={errorStyle}>{errors.products.message}</div>}
                    </>
                )}
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

export default DishForm;