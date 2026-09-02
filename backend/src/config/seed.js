// Seeds pre-created accounts, per docs/frozen-design.md — v1 has no self-signup,
// an admin creates accounts up front. Run manually: node src/config/seed.js
// Also called by setup.js during deployment (see that file).
//
// NOTE: these are demo/test PINs only. Never reuse simple PINs like this
// outside a local dev/demo database.

const bcrypt = require("bcrypt");
const pool = require("./db");

const seedUsers = [
  { name: "Alice (Retailer Staff)", phone: "0700000001", pin: "1234", role: "retailer_staff" },
  { name: "Brian (Dispatcher)", phone: "0700000002", pin: "1234", role: "dispatcher" },
  { name: "Carol (Rider)", phone: "0700000003", pin: "1234", role: "rider" },
  { name: "David (Rider)", phone: "0700000004", pin: "1234", role: "rider" },
];

// Exported so setup.js can call it directly (same pool, no extra process).
// Idempotent — ON CONFLICT DO NOTHING means running this repeatedly (e.g.
// on every deploy) is safe and won't duplicate or reset existing accounts.
async function seed() {
  for (const u of seedUsers) {
    const pinHash = await bcrypt.hash(u.pin, 10);
    await pool.query(
      `INSERT INTO users (name, phone, pin_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (phone) DO NOTHING`,
      [u.name, u.phone, pinHash, u.role]
    );
    console.log(`Seeded: ${u.name} (${u.role}) — phone: ${u.phone}, PIN: ${u.pin}`);
  }
  console.log("\nSeeding complete.");
}

module.exports = { seed, seedUsers };

// Still runnable directly: node src/config/seed.js
if (require.main === module) {
  seed()
    .then(() => pool.end())
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
