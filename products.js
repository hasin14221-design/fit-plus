const express = require("express");
const { query } = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await query(
            `SELECT *
             FROM products
             WHERE active = TRUE
             ORDER BY id DESC`
        );

        res.json({
            success: true,
            products: result.rows
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
            name,
            description,
            price,
            stock
        } = req.body;

        const result = await query(
            `INSERT INTO products
             (name, description, price, stock)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                name,
                description || "",
                price || 0,
                stock || 0
            ]
        );

        res.status(201).json({
            success: true,
            product: result.rows[0]
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;