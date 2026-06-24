const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis'); // Import Redis

const SECRET_KEY = process.env.JWT_SECRET;

exports.login = (req, res) => {
    const { employeeID, password } = req.body;
    const sql = `SELECT ul.userID, ul.hashedPassword, ul.isActive, u.role, u.firstName, u.lastName, u.dateCreated FROM UserLogins ul JOIN Users u ON ul.userID = u.userID WHERE ul.employeeID = ?`;

    db.query(sql, [employeeID], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) return res.status(401).json({ error: "Invalid Employee ID or Password" });

        try {
            const user = results[0];
            if (user.isActive === 0) {
                return res.status(403).json({ error: "Unauthorized: Account deactivated." });
            }

            const isMatch = await bcrypt.compare(password, user.hashedPassword);
            if (!isMatch) return res.status(401).json({ error: "Invalid Employee ID or Password" });

            const token = jwt.sign({ id: user.userID, role: user.role }, SECRET_KEY, { expiresIn: '12h' });

            if (redisClient.isOpen) {
                await redisClient.setEx(`session:${user.userID}`, 43200, token);
            }

            const updateTokenSql = "UPDATE UserLogins SET activeToken = ? WHERE userID = ?";
            db.query(updateTokenSql, [token, user.userID], (updateErr) => {
                if (updateErr) throw updateErr;

                res.json({
                    message: "Login success",
                    token,
                    user: {
                        userID: user.userID,
                        username: employeeID,
                        role: user.role,
                        fullName: `${user.firstName} ${user.lastName}`,
                        dateCreated: new Date(user.dateCreated).toLocaleDateString()
                    }
                });
            });

        } catch (error) {
            res.status(500).json({ error: "Internal Server Error during login." });
        }
    });
};

exports.logout = async (req, res) => {
    const userID = req.user.id; // From verifyToken

    // Clear from Redis
    if (redisClient.isOpen) {
        await redisClient.del(`session:${userID}`);
    }

    // Set activeToken to NULL
    const sql = "UPDATE UserLogins SET activeToken = NULL WHERE userID = ?";
    db.query(sql, [userID], (err) => {
        if (err) {
            console.error("Logout Error:", err);
            return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
    });
};