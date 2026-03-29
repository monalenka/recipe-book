import React, { useState, useEffect } from 'react';

const ImageUpload = ({ images = [], onImagesChange, max = 5 }) => {
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        setPreviews(images);
    }, [images]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (previews.length + files.length > max) {
            alert(`Максимум ${max} изображений`);
            return;
        }
        const newPreviews = [...previews, ...files];
        setPreviews(newPreviews);
        onImagesChange(newPreviews);
    };

    const handleRemove = (index) => {
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
        onImagesChange(newPreviews);
    };

    const containerStyle = {
        border: '1px dashed #ddd',
        padding: '15px',
        borderRadius: '4px',
    };

    const previewContainerStyle = {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginTop: '10px',
    };

    const imageContainerStyle = {
        position: 'relative',
    };

    const imageStyle = {
        width: '100px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '4px',
    };

    const removeButtonStyle = {
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <div style={containerStyle}>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
            <div style={previewContainerStyle}>
                {previews.map((img, idx) => (
                    <div key={idx} style={imageContainerStyle}>
                        {img instanceof File ? (
                            <img src={URL.createObjectURL(img)} alt="preview" style={imageStyle} />
                        ) : (
                            <img src={img} alt="preview" style={imageStyle} />
                        )}
                        <button type="button" onClick={() => handleRemove(idx)} style={removeButtonStyle}>×</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageUpload;