const express = require("express");
const { query } = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await query(`
            SELECT m.*, u.name AS member_name
            FROM memberships m
            JOIN users u ON u.id = m.user_id
            ORDER BY m.id DESC
        `);

        res.json({
            success: true,
            memberships: result.rows
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const {
            userId,
            plan,
            startDate,
            endDate,
            price
        } = req.body;

        const result = await query(
            `INSERT INTO memberships
             (user_id, plan, start_date, end_date, price)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                userId,
                plan,
                startDate,
                endDate,
                price || 0
            ]
        );

        await query(
            `INSERT INTO transactions
             (user_id, type, title, amount)
             VALUES ($1, 'income', $2, $3)`,
            [
                userId,
                "خرید عضویت " + plan,
                price || 0
            ]
        );

        res.status(201).json({
            success: true,
            membership: result.rows[0]
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;