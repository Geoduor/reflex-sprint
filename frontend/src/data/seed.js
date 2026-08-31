// Mock data used for the demo build. Swap for real data from
// Mark & Geofry's API once it's live — see src/api/mockApi.js
// for the functions that call into this data.

export const RIDERS = [
  { id: "rider-1", name: "Brian Otieno" },
  { id: "rider-2", name: "Alice Njeri" },
  { id: "rider-3", name: "Kevin Mwangi" },
];

export const RETAILER_NAME = "Tech Point Electronics — Nairobi";

export const seedRequests = [
  {
    id: "req-1",
    customer_name: "Wanjiku Kamau",
    customer_phone: "+254 712 334 556",
    address: "Kilimani, off Argwings Kodhek Rd",
    item_description: "Samsung Galaxy S24, 256GB",
    serial_number: "IMEI 356938035643809",
    created_at: "09:12",
    assignment: { rider_id: "rider-2", assigned_at: "09:15" },
    status: "Picked Up",
    events: [
      { status: "Assigned", timestamp: "09:15", changed_by: "Dispatcher", confirmation_scan: false },
      { status: "Picked Up", timestamp: "09:41", changed_by: "Alice Njeri", confirmation_scan: true },
    ],
  },
  {
    id: "req-2",
    customer_name: "Peter Otiende",
    customer_phone: "+254 733 998 210",
    address: "Westlands, ABC Place",
    item_description: 'MacBook Air 13" M2',
    serial_number: "SN C02FX2QAMD6P",
    created_at: "09:30",
    assignment: null,
    status: null,
    events: [],
  },
];
