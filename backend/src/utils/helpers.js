const getImageUrls = (files, fieldName = 'images') => {
    if (!files || !files[fieldName]) return [];
    return files[fieldName].map((file) => `${process.env.BASE_URL}/uploads/${file.filename}`);
};

const parseFlags = (flags) => {
    if (!flags) return [];
    if (Array.isArray(flags)) return flags;
    return flags.split(',').map(f => f.trim());
};

module.exports = { getImageUrls, parseFlags };