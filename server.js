const express = require("express");
const cors = require("cors");
const path = require("path");

const { testDatabase } = require("./database");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const membershipsRoutes = require("./routes/memberships");
const attendanceRoutes = require("./routes/attendance");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");
const financeRoutes = require("./routes/finance");
const crmRoutes = require("./routes/crm");
const loyaltyRoutes = require("./routes/loyalty");
const healthRoutes = require("./routes/health");
const gamesRoutes = require("./routes/games");
const paymentsRoutes = require("./routes/payments");
const aiRoutes = require("./routes/ai");

const app = express();

const PORT = process.env.PORT || 3000;

/* Middleware */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

/* Frontend */

app.use(
    express.static(
        path.join(__dirname)
    )
);

/* API */

app.get("/api", (req, res) => {

    res.json({
        success: true,
        name: "FIT+",
        version: "1.0.0",
        message: "FIT+ API is running"
    });

});

/* Database test */

app.get("/api/db-test", async (req, res) => {

    const connected =
        await testDatabase();

    if (!connected) {

        return res.status(500).json({
            success: false,
            message: "اتصال به PostgreSQL برقرار نشد"
        });

    }

    res.json({
        success: true,
        message: "اتصال PostgreSQL برقرار است"
    });

});

/* Routes */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    usersRoutes
);

app.use(
    "/api/memberships",
    membershipsRoutes
);

app.use(
    "/api/attendance",
    attendanceRoutes
);

app.use(
    "/api/products",
    productsRoutes
);

app.use(
    "/api/orders",
    ordersRoutes
);

app.use(
    "/api/finance",
    financeRoutes
);

app.use(
    "/api/crm",
    crmRoutes
);

app.use(
    "/api/loyalty",
    loyaltyRoutes
);

app.use(
    "/api/health",
    healthRoutes
);

app.use(
    "/api/games",
    gamesRoutes
);

app.use(
    "/api/payments",
    paymentsRoutes
);

app.use(
    "/api/ai",
    aiRoutes
);

/* Dashboard */

app.get("/api/dashboard", async (req, res) => {

    try {

        const {
            query
        } = require("./database");

        const users =
            await query(
                "SELECT COUNT(*) FROM users"
            );

        const members =
            await query(
                `SELECT COUNT(*)
                 FROM users
                 WHERE role = 'member'`
            );

        const attendance =
            await query(
                "SELECT COUNT(*) FROM attendance"
            );

        const orders =
            await query(
                "SELECT COUNT(*) FROM orders"
            );

        res.json({

            success: true,

            statistics: {

                users:
                    Number(users.rows[0].count),

                members:
                    Number(members.rows[0].count),

                attendance:
                    Number(attendance.rows[0].count),

                orders:
                    Number(orders.rows[0].count)

            }

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

/* Frontend */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});

/* API 404 */

app.use("/api", (req, res) => {

    res.status(404).json({

        success: false,

        message: "API route not found"

    });

});

/* Server */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `FIT+ running on port ${PORT}`
        );

        console.log(
            `http://localhost:${PORT}`
        );

    }
);