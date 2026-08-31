const pool = require("../config/db");

// Lists users, optionally filtered by role (e.g. ?role=rider).
// Added to close a real gap found while wiring the frontend: the
// dispatcher needs to see available riders to assign to, and nothing
// previously exposed that. Deliberately returns only id/name/role —
// never phone or pin_hash, even to an authenticated caller.
async function listUsers(req, res) {
  const { role } = req.query;

  const validRoles = ["retailer_staff", "dispatcher", "rider"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role filter. Must be one of: ${validRoles.join(", ")}` });
  }

  const result = role
    ? await pool.query("SELECT id, name, role FROM users WHERE role = $1 ORDER BY name", [role])
    : await pool.query("SELECT id, name, role FROM users ORDER BY role, name");

  res.json(result.rows);
}

module.exports = { listUsers };
