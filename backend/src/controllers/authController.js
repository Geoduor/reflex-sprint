// Login for pre-seeded accounts. See docs/frozen-design.md,
// "Authentication & Account Creation" — no self-signup in v1, accounts are
// created by an admin (see seed script), login is phone + PIN.
//
// NOTE: this issues a plain user-id "token" for sprint-scope simplicity —
// the auth middleware (src/middleware/auth.js) currently just checks that
// this id maps to a real user. Swap in real sessions/JWT before this goes
// anywhere near production; flagged here so it isn't mistaken for finished.

const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function login(req, res) {
  const { phone, pin } = req.body;

  if (!phone || !pin) {
    return res.status(400).json({ error: "Phone and PIN are required" });
  }

  const result = await pool.query(
    "SELECT id, name, phone, role, pin_hash FROM users WHERE phone = $1",
    [phone]
  );

  if (result.rows.length === 0) {
    // Same error for "no such user" and "wrong pin" — don't leak which one
    // failed, so this can't be used to enumerate valid phone numbers.
    return res.status(401).json({ error: "Invalid phone or PIN" });
  }

  const user = result.rows[0];
  const pinMatches = await bcrypt.compare(pin, user.pin_hash);

  if (!pinMatches) {
    return res.status(401).json({ error: "Invalid phone or PIN" });
  }

  // v1 "token" — see NOTE above. Client sends this back as the x-user-id header.
  res.json({
    token: user.id,
    user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
  });
}

module.exports = { login };
