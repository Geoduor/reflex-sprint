const pool = require("../config/db");

// Rider marks a delivery as picked up.
async function markPickedUp(req, res) {
  const { delivery_request_id } = req.body;
  await assertRiderOwnsRequest(req, delivery_request_id);

  await pool.query(`UPDATE delivery_requests SET status = 'picked_up' WHERE id = $1`, [delivery_request_id]);
  await pool.query(
    `INSERT INTO status_events (delivery_request_id, status, changed_by) VALUES ($1, 'picked_up', $2)`,
    [delivery_request_id, req.user.id]
  );

  req.app.get("io").emit("status:updated", { delivery_request_id, status: "picked_up" });
  res.json({ status: "picked_up" });
}

// Rider confirms delivery via scan.
// See docs/frozen-design.md, Status Flow: a mismatched or failed scan does NOT
// advance the status — it's logged as a blocking event, and the rider must
// retry or escalate to the dispatcher with a note.
async function confirmDelivery(req, res) {
  const { delivery_request_id, scanned_value } = req.body;
  await assertRiderOwnsRequest(req, delivery_request_id);

  const reqResult = await pool.query(`SELECT serial_number FROM delivery_requests WHERE id = $1`, [
    delivery_request_id,
  ]);
  const expectedSerial = reqResult.rows[0]?.serial_number;

  const scanMatches = !expectedSerial || expectedSerial === scanned_value;

  if (!scanMatches) {
    // Blocking event — status does NOT move to delivered.
    await pool.query(
      `INSERT INTO status_events (delivery_request_id, status, changed_by, confirmation_scan, note)
       VALUES ($1, 'scan_failed', $2, $3, $4)`,
      [delivery_request_id, req.user.id, scanned_value, req.body.note || "Scan did not match — needs review"]
    );
    return res.status(409).json({
      error: "Scan did not match the expected item. Retry the scan or escalate to your dispatcher.",
    });
  }

  await pool.query(`UPDATE delivery_requests SET status = 'delivered' WHERE id = $1`, [delivery_request_id]);
  await pool.query(
    `INSERT INTO status_events (delivery_request_id, status, changed_by, confirmation_scan)
     VALUES ($1, 'delivered', $2, $3)`,
    [delivery_request_id, req.user.id, scanned_value]
  );

  req.app.get("io").emit("status:updated", { delivery_request_id, status: "delivered" });
  // TODO (Mark/team): trigger SMS to customer here — see frozen-design.md,
  // "What Happens Outside the App". Not wired up yet; needs an SMS provider key.
  res.json({ status: "delivered" });
}

// Escalation path when a rider can't resolve a failed scan themselves.
async function escalate(req, res) {
  const { delivery_request_id, note } = req.body;
  await assertRiderOwnsRequest(req, delivery_request_id);

  if (!note) {
    return res.status(400).json({ error: "A note explaining the issue is required to escalate" });
  }

  await pool.query(
    `INSERT INTO status_events (delivery_request_id, status, changed_by, note)
     VALUES ($1, 'scan_failed', $2, $3)`,
    [delivery_request_id, req.user.id, note]
  );

  req.app.get("io").emit("delivery:escalated", { delivery_request_id, note });
  res.json({ status: "escalated" });
}

// Enforces: only the assigned rider can update their own delivery's status.
// Server-side, per frozen-design.md — not just hidden in the UI.
async function assertRiderOwnsRequest(req, deliveryRequestId) {
  const result = await pool.query(
    `SELECT 1 FROM assignments WHERE delivery_request_id = $1 AND rider_id = $2`,
    [deliveryRequestId, req.user.id]
  );
  if (result.rows.length === 0) {
    const err = new Error("You are not the assigned rider for this delivery");
    err.status = 403;
    throw err;
  }
}

module.exports = { markPickedUp, confirmDelivery, escalate };
