const express = require("express");
const bcrypt = require("bcryptjs");
const { query } = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await query(
            `SELECT id, name, username, phone,
                    role, status, points, created_at
             FROM users
             ORDER BY id DESC`
        );

        res.json({
            success: true,
            users: result.rows
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
            username,
            password,
            phone,
            role
        } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({
                success: false,
                message: "اطلاعات کامل نیست"
            });
        }

        const passwordHash =
            await bcrypt.hash(password, 12);

        const result = await query(
            `INSERT INTO users
             (name, username, password_hash, phone, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, username, phone,
                       role, status, points`,
            [
                name,
                username,
                passwordHash,
                phone || "",
                role || "member"
            ]
        );

        res.status(201).json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await query(
            "DELETE FROM users WHERE id = $1",
            [req.params.id]
        );

        res.json({
            success: true,
            message: "کاربر حذف شد"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;