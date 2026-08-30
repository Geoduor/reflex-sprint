const pool = require("../config/db");

// Dispatcher assigns a rider to an open request.
// Concurrency: the UNIQUE constraint on assignments.delivery_request_id is what
// actually prevents double-assignment if two dispatchers act at once — see
// docs/frozen-design.md, "Assignment Logic". This handler just surfaces that
// as a clean error instead of a raw DB error.
async function assignRider(req, res) {
  const { delivery_request_id, rider_id } = req.body;

  if (!delivery_request_id || !rider_id) {
    return res.status(400).json({ error: "Missing delivery_request_id or rider_id" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let assignment;
    try {
      const result = await client.query(
        `INSERT INTO assignments (delivery_request_id, rider_id, assigned_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [delivery_request_id, rider_id, req.user.id]
      );
      assignment = result.rows[0];
    } catch (err) {
      if (err.code === "23505") {
        // unique_violation — someone else already assigned this request
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "This request has already been assigned" });
      }
      throw err;
    }

    await client.query(
      `UPDATE delivery_requests SET status = 'assigned' WHERE id = $1`,
      [delivery_request_id]
    );

    await client.query(
      `INSERT INTO status_events (delivery_request_id, status, changed_by)
       VALUES ($1, 'assigned', $2)`,
      [delivery_request_id, req.user.id]
    );

    await client.query("COMMIT");

    req.app.get("io").emit("request:assigned", { delivery_request_id, rider_id, assignment });
    res.status(201).json(assignment);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to assign rider" });
  } finally {
    client.release();
  }
}

// Rider views their assigned deliveries
async function listMyDeliveries(req, res) {
  const result = await pool.query(
    `SELECT dr.*, a.assigned_at
     FROM delivery_requests dr
     JOIN assignments a ON a.delivery_request_id = dr.id
     WHERE a.rider_id = $1 AND dr.status != 'delivered'
     ORDER BY a.assigned_at ASC`,
    [req.user.id]
  );
  res.json(result.rows);
}

module.exports = { assignRider, listMyDeliveries };
