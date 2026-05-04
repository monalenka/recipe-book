import React, { useState, useEffect } from 'react';

const ImageUpload = ({ images = [], onImagesChange, max = 5 }) => {
    const [previews, setPreviews] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        setPreviews(images);
    }, [images]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (previews.length + files.length > max) {
            setError(`Максимум ${max} изображений`);
            e.target.value = null;
            return;
        }
        setError('');
        const newPreviews = [...previews, ...files];
        setPreviews(newPreviews);
        onImagesChange(newPreviews);
        e.target.value = null;
    };

    const handleRemove = (index) => {
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
        onImagesChange(newPreviews);
    };

    return (
        <div style={{ border: '1px dashed #ddd', padding: '15px', borderRadius: '4px' }}>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                {previews.length} из {max} файлов
            </div>
            {error && <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {previews.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                        {img instanceof File ? (
                            <img src={URL.createObjectURL(img)} alt="preview" width="100" height="100" style={{ objectFit: 'cover' }} />
                        ) : (
                            <img src={img} alt="preview" width="100" height="100" style={{ objectFit: 'cover' }} />
                        )}
                        <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageUpload;