const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { createRequest, listOpenRequests, listMyRequests } = require("../controllers/requestsController");

router.post("/", requireAuth, requireRole("retailer_staff"), asyncHandler(createRequest));
router.get("/open", requireAuth, requireRole("dispatcher"), asyncHandler(listOpenRequests));
router.get("/mine", requireAuth, requireRole("retailer_staff"), asyncHandler(listMyRequests));

module.exports = router;
