const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { listUsers } = require("../controllers/usersController");

// Restricted to dispatchers for now, since the only current use case is
// building the rider-assignment list. Widen this if another role needs
// it later (e.g. an admin screen).
router.get("/", requireAuth, requireRole("dispatcher"), asyncHandler(listUsers));

module.exports = router;
