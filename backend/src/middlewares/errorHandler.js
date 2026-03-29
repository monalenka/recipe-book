module.exports = (err, req, res, next) => {
    console.error(err);

    if (err.message === 'Product not found') {
        return res.status(404).json({ error: err.message });
    }

    if (err.message === 'Dish not found') {
        return res.status(404).json({ error: err.message });
    }

    if (err.message.startsWith('Cannot delete product')) {
        return res.status(400).json({ error: err.message });
    }

    if (err.message === 'Dish must have at least one product') {
        return res.status(400).json({ error: err.message });
    }

    if (err.message === 'Category is required') {
        return res.status(400).json({ error: err.message });
    }

    if (err.message.includes('Flag') && err.message.includes('not available')) {
        return res.status(400).json({ error: err.message });
    }

    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ error: err.message });
    }

    if (err.message.includes('Сумма белков, жиров и углеводов')) {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
};