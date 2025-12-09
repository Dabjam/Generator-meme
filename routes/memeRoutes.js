const express = require('express');
const router = express.Router();
const memeController = require('../controllers/memeController');
const requestLogger = require('../middleware/logger');

router.use(requestLogger);

router.get('/images', memeController.getAllImages);

router.get('/images/:id', memeController.getImageById);

router.post('/', memeController.createMeme);

router.get('/', memeController.getAllMemes);

router.get('/:id', memeController.getMemeById);

router.put('/:id', memeController.updateMeme);

router.delete('/:id', memeController.deleteMeme);

module.exports = router;