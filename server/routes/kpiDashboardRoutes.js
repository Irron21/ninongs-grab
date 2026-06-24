const express = require('express');
const router = express.Router();
const kpiDashboardController = require('../controllers/kpiDashboardController');

router.get('/', kpiDashboardController.getKpiData);
router.post('/', kpiDashboardController.addKpiData);

module.exports = router;
