const express = require('express');
const multer = require('multer');
const path = require('path');
const dishController = require('../controllers/dishController');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { files: 5, fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    },
});

router.get('/', dishController.getAllDishes);
router.get('/:id', dishController.getDishById);
router.post('/', upload.array('images', 5), dishController.createDish);
router.put('/:id', upload.array('images', 5), dishController.updateDish);
router.delete('/:id', dishController.deleteDish);

module.exports = router;