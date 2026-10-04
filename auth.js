const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const { query } = require("../database");

const JWT_SECRET =
    process.env.JWT_SECRET || "CHANGE_THIS_SECRET";

const otpStore = new Map();

/*
ثبت‌نام:
شماره موبایل + نام
*/
router.post("/register", async (req, res) => {

    try {

        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: "نام و شماره موبایل الزامی است"
            });
        }

        const existing = await query(
            "SELECT id FROM users WHERE phone = $1",
            [phone]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "این شماره قبلاً ثبت شده است"
            });
        }

        const otp =
            Math.floor(
                100000 + Math.random() * 900000
            ).toString();

        otpStore.set(phone, {
            otp,
            name,
            expires:
                Date.now() + 2 * 60 * 1000
        });

        /*
        فعلاً OTP در سرور ثبت می‌شود.
        برای ارسال واقعی SMS باید سرویس پیامکی
        به این قسمت متصل شود.
        */

        console.log(
            `OTP for ${phone}: ${otp}`
        );

        res.json({
            success: true,
            message: "کد تأیید ایجاد شد",
            demoOtp: process.env.NODE_ENV === "production"
                ? undefined
                : otp
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "خطای سرور"
        });

    }

});


/*
تأیید OTP و ساخت حساب
*/
router.post("/verify-otp", async (req, res) => {

    try {

        const {
            phone,
            otp,
            password
        } = req.body;

        if (!phone || !otp || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "شماره، کد تأیید و رمز عبور الزامی است"
            });
        }

        const saved =
            otpStore.get(phone);

        if (!saved) {
            return res.status(400).json({
                success: false,
                message: "کد تأیید پیدا نشد"
            });
        }

        if (Date.now() > saved.expires) {

            otpStore.delete(phone);

            return res.status(400).json({
                success: false,
                message: "کد تأیید منقضی شده است"
            });
        }

        if (saved.otp !== otp) {

            return res.status(400).json({
                success: false,
                message: "کد تأیید اشتباه است"
            });
        }

        const passwordHash =
            await bcrypt.hash(password, 10);

        const username =
            "user_" +
            phone.replace(/\D/g, "");

        const result = await query(
            `INSERT INTO users
            (name, username, password_hash, phone, role)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING id,name,username,phone,role,points`,
            [
                saved.name,
                username,
                passwordHash,
                phone,
                "member"
            ]
        );

        otpStore.delete(phone);

        const user =
            result.rows[0];

        const token =
            jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        res.status(201).json({
            success: true,
            message: "ثبت‌نام با موفقیت انجام شد",
            token,
            user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "ثبت‌نام انجام نشد"
        });

    }

});


/*
ورود
*/
router.post("/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        const result = await query(
            `SELECT *
             FROM users
             WHERE username = $1
             LIMIT 1`,
            [username]
        );

        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message:
                    "نام کاربری یا رمز عبور اشتباه است"
            });

        }

        const user =
            result.rows[0];

        const valid =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!valid) {

            return res.status(401).json({
                success: false,
                message:
                    "نام کاربری یا رمز عبور اشتباه است"
            });

        }

        const token =
            jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        delete user.password_hash;

        res.json({
            success: true,
            token,
            user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "خطای سرور"
        });

    }

});


module.exports = router;