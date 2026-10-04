const express = require("express");
const { query } = require("../database");

const router = express.Router();

router.post("/play", async (req, res) => {
    try {
        const {
            userId,
            gameName
        } = req.body;

        const reward =
            Math.floor(
                Math.random() * 41
            ) + 10;

        const result = await query(
            `INSERT INTO games
             (user_id, game_name, reward_points)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                userId,
                gameName || "daily-game",
                reward
            ]
        );

        await query(
            `UPDATE users
             SET points = points + $1
             WHERE id = $2`,
            [reward, userId]
        );

        res.json({
            success: true,
            reward,
            game: result.rows[0]
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;