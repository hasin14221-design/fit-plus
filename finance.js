const express = require("express");
const { query } = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await query(`
            SELECT *
            FROM transactions
            ORDER BY id DESC
        `);

        const income =
            result.rows
                .filter(x => x.type === "income")
                .reduce(
                    (sum, x) => sum + Number(x.amount),
                    0
                );

        const expense =
            result.rows
                .filter(x => x.type === "expense")
                .reduce(
                    (sum, x) => sum + Number(x.amount),
                    0
                );

        res.json({
            success: true,
            income,
            expense,
            balance: income - expense,
            transactions: result.rows
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
            type,
            title,
            amount,
            description
        } = req.body;

        const result = await query(
            `INSERT INTO transactions
             (user_id, type, title, amount, description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                userId || null,
                type,
                title,
                amount,
                description || ""
            ]
        );

        res.status(201).json({
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

module.exports = router;