// PostgreSQL connection pool.
// Reads DATABASE_URL from environment — see .env.example.
// Do NOT hardcode credentials here; use .env locally (gitignored) and real
// environment variables in any deployed environment.

const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.warn(
    "Warning: DATABASE_URL is not set. Copy .env.example to .env and fill in your connection string."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

module.exports = pool;
