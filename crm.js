const express = require("express");
const { query } = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await query(`
            SELECT c.*, u.name AS member_name
            FROM crm_records c
            LEFT JOIN users u ON u.id = c.user_id
            ORDER BY c.id DESC
        `);

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
            title,
            note
        } = req.body;

        const result = await query(
            `INSERT INTO crm_records
             (user_id, title, note)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                userId,
                title,
                note || ""
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