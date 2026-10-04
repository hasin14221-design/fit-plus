const express = require("express");

const router = express.Router();

router.post("/analyze", async (req, res) => {

    const {
        question,
        memberData
    } = req.body;

    if (!question) {
        return res.status(400).json({
            success: false,
            message: "سؤال وارد نشده است"
        });
    }

    /*
      این قسمت برای اتصال به سرویس AI
      طراحی شده است.

      کلید API نباید داخل index.html
      یا کد سمت کاربر قرار بگیرد.
    */

    res.json({
        success: true,
        status: "ready",
        question,
        memberData: memberData || null,
        message:
            "ماژول هوش مصنوعی آماده اتصال به API است."
    });

});

module.exports = router;