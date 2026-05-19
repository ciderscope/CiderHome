const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3000/api";
const secret = process.env.SENSOR_INGESTION_SECRET ?? "change-me";

const reading = {
  id: crypto.randomUUID(),
  siteId: "11111111-1111-4111-8111-111111111111",
  sensorId: "temp-c01",
  tankId: "33333333-3333-4333-8333-333333333333",
  measuredAt: new Date().toISOString(),
  metrics: {
    temperatureC: 12 + Math.random() * 4,
    ph: 3.4 + Math.random() * 0.3,
    volumeLiters: 7100 + Math.round(Math.random() * 100)
  },
  rawPayload: { simulator: "http" },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const response = await fetch(`${apiBaseUrl}/sensors/ingest`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-ingestion-secret": secret
  },
  body: JSON.stringify(reading)
});

console.info(response.status, await response.text());

