const express = require("express");
const { query } = require("../database");

const router = express.Router();

router.post("/checkin", async (req, res) => {
    try {
        const { userId } = req.body;

        const result = await query(
            `INSERT INTO attendance
             (user_id, type)
             VALUES ($1, 'checkin')
             RETURNING *`,
            [userId]
        );

        await query(
            `UPDATE users
             SET points = points + 10
             WHERE id = $1`,
            [userId]
        );

        res.json({
            success: true,
            message: "ورود ثبت شد",
            record: result.rows[0]
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.post("/checkout", async (req, res) => {
    try {
        const { userId } = req.body;

        const result = await query(
            `UPDATE attendance
             SET checkout_time = CURRENT_TIMESTAMP
             WHERE id = (
                 SELECT id
                 FROM attendance
                 WHERE user_id = $1
                   AND type = 'checkin'
                   AND checkout_time IS NULL
                 ORDER BY id DESC
                 LIMIT 1
             )
             RETURNING *`,
            [userId]
        );

        res.json({
            success: true,
            message: "خروج ثبت شد",
            record: result.rows[0] || null
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const result = await query(`
            SELECT a.*, u.name AS member_name
            FROM attendance a
            JOIN users u ON u.id = a.user_id
            ORDER BY a.id DESC
        `);

        res.json({
            success: true,
            attendance: result.rows
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;