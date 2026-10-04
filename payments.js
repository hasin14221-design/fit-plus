const express = require("express");
const { query } = require("../database");

const router = express.Router();

router.post("/create", async (req, res) => {
    try {
        const {
            userId,
            orderId,
            amount,
            gateway
        } = req.body;

        const result = await query(
            `INSERT INTO payments
             (user_id, order_id, amount, gateway)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                userId,
                orderId || null,
                amount,
                gateway || "pending"
            ]
        );

        /*
          اتصال به درگاه واقعی در این قسمت
          بعد از مشخص شدن درگاه مورد تأیید کارفرما
          انجام می‌شود.
        */

        res.status(201).json({
            success: true,
            payment: result.rows[0],
            message: "پرداخت ایجاد شد"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.post("/verify", async (req, res) => {
    try {
        const {
            paymentId,
            referenceId
        } = req.body;

        const result = await query(
            `UPDATE payments
             SET status = 'paid',
                 reference_id = $1
             WHERE id = $2
             RETURNING *`,
            [
                referenceId,
                paymentId
            ]
        );

        res.json({
            success: true,
            payment: result.rows[0] || null
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;