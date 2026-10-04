const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
});

async function query(text, params) {
    return pool.query(text, params);
}

async function testDatabase() {

    try {

        await pool.query("SELECT 1");

        console.log(
            "PostgreSQL connected successfully"
        );

        return true;

    } catch (error) {

        console.error(
            "PostgreSQL connection error:",
            error.message
        );

        return false;
    }
}

module.exports = {
    pool,
    query,
    testDatabase
};