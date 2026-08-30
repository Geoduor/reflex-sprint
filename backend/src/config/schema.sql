-- Reflex database schema
-- Matches docs/frozen-design.md data model

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('retailer_staff', 'dispatcher', 'rider')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_requests (
    id SERIAL PRIMARY KEY,
    retailer_id INTEGER NOT NULL REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    item_description TEXT NOT NULL,
    serial_number VARCHAR(255), -- optional: phone/laptop/TV IMEI or serial
    status VARCHAR(20) NOT NULL DEFAULT 'unassigned'
        CHECK (status IN ('unassigned', 'assigned', 'picked_up', 'delivered')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    delivery_request_id INTEGER NOT NULL UNIQUE REFERENCES delivery_requests(id),
    -- UNIQUE constraint above is deliberate: prevents two dispatchers from
    -- double-assigning the same request (see frozen-design.md, Assignment Logic)
    rider_id INTEGER NOT NULL REFERENCES users(id),
    assigned_by INTEGER NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS status_events (
    id SERIAL PRIMARY KEY,
    delivery_request_id INTEGER NOT NULL REFERENCES delivery_requests(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('assigned', 'picked_up', 'delivered', 'scan_failed')),
    changed_by INTEGER NOT NULL REFERENCES users(id),
    confirmation_scan VARCHAR(255), -- scanned serial/IMEI value, if applicable
    note TEXT, -- required when status is scan_failed / escalation (see frozen-design.md)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_requests_status ON delivery_requests(status);
CREATE INDEX IF NOT EXISTS idx_status_events_request ON status_events(delivery_request_id);
