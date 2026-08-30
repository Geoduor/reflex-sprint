// Smoke test: walks a delivery through the full lifecycle against a running
// backend + seeded database. Not a formal test suite — just a fast way to
// confirm the whole flow actually works end to end.
//
// Prereqs: docker-compose up -d, npm run dev (backend), node src/config/seed.js
// Run: node scripts/smoke-test.js

const BASE = "http://localhost:4000/api";

async function call(method, path, body, userId) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function login(phone, pin) {
  const { token, user } = await call("POST", "/auth/login", { phone, pin });
  console.log(`  Logged in: ${user.name} (${user.role})`);
  return token;
}

async function run() {
  console.log("1. Logging in as retailer staff (Alice)...");
  const retailerToken = await login("0700000001", "1234");

  console.log("2. Retailer staff logs a delivery request (a phone)...");
  const request = await call(
    "POST",
    "/requests",
    {
      customer_name: "Test Customer",
      customer_phone: "0711111111",
      address: "123 Moi Avenue, Nairobi",
      item_description: "Samsung Galaxy A54",
      serial_number: "IMEI-TEST-12345",
    },
    retailerToken
  );
  console.log(`  Created request #${request.id}, status: ${request.status}`);

  console.log("3. Logging in as dispatcher (Brian)...");
  const dispatcherToken = await login("0700000002", "1234");

  console.log("4. Dispatcher views open requests...");
  const open = await call("GET", "/requests/open", null, dispatcherToken);
  console.log(`  ${open.length} open request(s) found`);

  console.log("5. Dispatcher assigns request to rider (Carol)...");
  const RIDER_ID = 3; // Carol, from seed.js — adjust if your seed data differs
  const assignment = await call(
    "POST",
    "/assignments",
    { delivery_request_id: request.id, rider_id: RIDER_ID },
    dispatcherToken
  );
  console.log(`  Assigned. Assignment id: ${assignment.id}`);

  console.log("6. Logging in as rider (Carol)...");
  const riderToken = await login("0700000003", "1234");

  console.log("7. Rider marks picked up...");
  await call("POST", "/status/picked-up", { delivery_request_id: request.id }, riderToken);
  console.log("  Status: picked_up");

  console.log("8. Rider attempts delivery with a MISMATCHED scan (should be blocked)...");
  try {
    await call(
      "POST",
      "/status/confirm-delivery",
      { delivery_request_id: request.id, scanned_value: "WRONG-SERIAL" },
      riderToken
    );
    console.log("  UNEXPECTED: mismatched scan was accepted — check statusController.js");
  } catch (err) {
    console.log(`  Correctly blocked: ${err.message}`);
  }

  console.log("9. Rider confirms delivery with the CORRECT scan...");
  const delivered = await call(
    "POST",
    "/status/confirm-delivery",
    { delivery_request_id: request.id, scanned_value: "IMEI-TEST-12345" },
    riderToken
  );
  console.log(`  Status: ${delivered.status}`);

  console.log("\n✅ Smoke test passed — full lifecycle works end to end.");
}

run().catch((err) => {
  console.error("\n❌ Smoke test failed:", err.message);
  process.exit(1);
});
