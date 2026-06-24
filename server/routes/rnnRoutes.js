const express = require('express');
const router = express.Router();
const rnnController = require('../controllers/rnnController');

router.get('/', rnnController.getRnnForecasts);
router.post('/', rnnController.addRnnForecast);

module.exports = router;
