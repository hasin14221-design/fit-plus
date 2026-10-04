const express = require("express");
const { query } = require("../database");

const router = express.Router();

router.post("/points", async (req, res) => {
    try {
        const {
            userId,
            points,
            reason
        } = req.body;

        await query(
            `UPDATE users
             SET points = points + $1
             WHERE id = $2`,
            [points, userId]
        );

        const result = await query(
            `INSERT INTO loyalty_transactions
             (user_id, points, reason)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                userId,
                points,
                reason || ""
            ]
        );

        res.json({
            success: true,
            transaction: result.rows[0]
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.get("/:userId", async (req, res) => {
    try {
        const result = await query(
            `SELECT *
             FROM loyalty_transactions
             WHERE user_id = $1
             ORDER BY id DESC`,
            [req.params.userId]
        );

        res.json({
            success: true,
            transactions: result.rows
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;