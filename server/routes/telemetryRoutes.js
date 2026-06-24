const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');

router.get('/', telemetryController.getTelemetryData);
router.post('/', telemetryController.addTelemetryData);

module.exports = router;
