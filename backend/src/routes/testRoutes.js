const express = require('express');
const router = express.Router();
const { resetDatabase } = require('../utils/resetDatabase');

router.delete('/reset', async (req, res) => {
    if (process.env.NODE_ENV !== 'test') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    try {
        await resetDatabase();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset database' });
    }
});

module.exports = router;