const db = require('../config/db');

exports.getKpiData = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM KPIDashboardMetrics');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addKpiData = async (req, res) => {
    res.status(201).json({ message: 'Module running' });
};
