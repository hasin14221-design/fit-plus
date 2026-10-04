const express = require("express");
const { query } = require("../database");

const router = express.Router();

router.get("/:userId", async (req, res) => {
    try {
        const result = await query(
            `SELECT *
             FROM health_records
             WHERE user_id = $1
             ORDER BY id DESC`,
            [req.params.userId]
        );

        res.json({
            success: true,
            records: result.rows
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
            height,
            weight,
            goal,
            notes
        } = req.body;

        const result = await query(
            `INSERT INTO health_records
             (user_id, height, weight, goal, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                userId,
                height || null,
                weight || null,
                goal || "",
                notes || ""
            ]
        );

        res.status(201).json({
            success: true,
            record: result.rows[0]
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;