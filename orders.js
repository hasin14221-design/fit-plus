const express = require("express");
const { query } = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await query(`
            SELECT o.*, u.name AS customer_name
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ORDER BY o.id DESC
        `);

        res.json({
            success: true,
            orders: result.rows
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post("/", async (req, res) => {
    const client = await require("../database").pool.connect();

    try {
        const {
            userId,
            items
        } = req.body;

        await client.query("BEGIN");

        let total = 0;

        for (const item of items) {

            const product =
                await client.query(
                    "SELECT * FROM products WHERE id = $1 FOR UPDATE",
                    [item.productId]
                );

            if (!product.rows[0]) {
                throw new Error("محصول پیدا نشد");
            }

            if (
                product.rows[0].stock <
                item.quantity
            ) {
                throw new Error(
                    "موجودی محصول کافی نیست"
                );
            }

            total +=
                Number(product.rows[0].price) *
                Number(item.quantity);
        }

        const order =
            await client.query(
                `INSERT INTO orders
                 (user_id, total)
                 VALUES ($1, $2)
                 RETURNING *`,
                [userId, total]
            );

        for (const item of items) {

            const product =
                await client.query(
                    "SELECT price FROM products WHERE id = $1",
                    [item.productId]
                );

            await client.query(
                `INSERT INTO order_items
                 (order_id, product_id, quantity, unit_price)
                 VALUES ($1, $2, $3, $4)`,
                [
                    order.rows[0].id,
                    item.productId,
                    item.quantity,
                    product.rows[0].price
                ]
            );

            await client.query(
                `UPDATE products
                 SET stock = stock - $1
                 WHERE id = $2`,
                [
                    item.quantity,
                    item.productId
                ]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            order: order.rows[0]
        });

    } catch (error) {

        await client.query("ROLLBACK");

        res.status(400).json({
            success: false,
            message: error.message
        });

    } finally {
        client.release();
    }
});

module.exports = router;