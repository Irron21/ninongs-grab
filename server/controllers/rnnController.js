const db = require('../config/db');

exports.getRnnForecasts = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM RNNForecasts');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addRnnForecast = async (req, res) => {
    res.status(201).json({ message: 'Module running' });
};
