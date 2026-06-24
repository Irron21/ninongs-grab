const express = require('express');
const router = express.Router();
const geospatialController = require('../controllers/geospatialController');

router.get('/', geospatialController.getGeospatialData);
router.post('/', geospatialController.addGeospatialData);

module.exports = router;
