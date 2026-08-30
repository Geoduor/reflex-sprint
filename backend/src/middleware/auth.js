// v1 auth: accounts are pre-seeded by an admin (no self-signup).
// See docs/frozen-design.md, "Authentication & Account Creation".
// This is intentionally simple for a single-shop deployment.

const pool = require("../config/db");

// Attaches req.user if a valid session token is present.
// NOTE: token scheme kept minimal for the sprint scope — swap in JWT
// or a real session store before this goes anywhere near production.
async function requireAuth(req, res, next) {
  const userId = req.header("x-user-id"); // placeholder auth for demo purposes
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const result = await pool.query("SELECT id, name, phone, role FROM users WHERE id = $1", [userId]);
  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Invalid user" });
  }

  req.user = result.rows[0];
  next();
}

// Restricts a route to specific roles, e.g. requireRole('dispatcher')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized for this action" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
