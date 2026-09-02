// Runs on every deploy (see render.yaml's buildCommand for the backend
// service). Applies schema.sql, then seeds test accounts. Both steps are
// idempotent — schema.sql uses CREATE TABLE IF NOT EXISTS, and seed.js
// uses ON CONFLICT DO NOTHING — so running this on every deploy is safe
// and won't wipe or duplicate existing data.
//
// Can also be run manually: node src/config/setup.js

const fs = require("fs");
const path = require("path");
const pool = require("./db");
const { seed } = require("./seed");

async function setup() {
  console.log("Applying schema...");
  const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schemaSql);
  console.log("Schema applied.\n");

  console.log("Seeding accounts...");
  await seed();

  await pool.end();
  console.log("\nSetup complete.");
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
