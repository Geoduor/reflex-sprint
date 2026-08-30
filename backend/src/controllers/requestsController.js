const pool = require("../config/db");

// Retailer staff creates a new delivery request
async function createRequest(req, res) {
  const { customer_name, customer_phone, address, item_description, serial_number } = req.body;

  if (!customer_name || !customer_phone || !address || !item_description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const result = await pool.query(
    `INSERT INTO delivery_requests
      (retailer_id, customer_name, customer_phone, address, item_description, serial_number, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'unassigned')
     RETURNING *`,
    [req.user.id, customer_name, customer_phone, address, item_description, serial_number || null]
  );

  const newRequest = result.rows[0];

  // Notify dispatchers in real time (see frozen-design.md, real-time sync requirement)
  req.app.get("io").emit("request:created", newRequest);

  res.status(201).json(newRequest);
}

// Dispatcher views all open (unassigned) requests
async function listOpenRequests(req, res) {
  const result = await pool.query(
    `SELECT * FROM delivery_requests WHERE status = 'unassigned' ORDER BY created_at ASC`
  );
  res.json(result.rows);
}

// Retailer views their own requests (any status)
async function listMyRequests(req, res) {
  const result = await pool.query(
    `SELECT * FROM delivery_requests WHERE retailer_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
}

module.exports = { createRequest, listOpenRequests, listMyRequests };
