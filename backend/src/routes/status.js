const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { markPickedUp, confirmDelivery, escalate } = require("../controllers/statusController");

router.post("/picked-up", requireAuth, requireRole("rider"), asyncHandler(markPickedUp));
router.post("/confirm-delivery", requireAuth, requireRole("rider"), asyncHandler(confirmDelivery));
router.post("/escalate", requireAuth, requireRole("rider"), asyncHandler(escalate));

module.exports = router;
