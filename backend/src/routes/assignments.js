const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { assignRider, listMyDeliveries } = require("../controllers/assignmentsController");

router.post("/", requireAuth, requireRole("dispatcher"), asyncHandler(assignRider));
router.get("/mine", requireAuth, requireRole("rider"), asyncHandler(listMyDeliveries));

module.exports = router;
