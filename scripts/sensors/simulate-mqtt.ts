import mqtt from "mqtt";

const mqttUrl = process.env.MQTT_URL ?? "mqtt://localhost:1883";
const topic = process.env.MQTT_SENSOR_TOPIC?.replace("+", "temp-c01") ?? "cuverie/temp-c01/readings";
const client = mqtt.connect(mqttUrl);

client.on("connect", () => {
  const now = new Date().toISOString();
  const payload = {
    id: crypto.randomUUID(),
    siteId: "11111111-1111-4111-8111-111111111111",
    sensorId: "temp-c01",
    tankId: "33333333-3333-4333-8333-333333333333",
    measuredAt: now,
    metrics: { temperatureC: 13.2, ph: 3.55, volumeLiters: 7200 },
    rawPayload: { simulator: "mqtt" },
    createdAt: now,
    updatedAt: now
  };

  client.publish(topic, JSON.stringify(payload), () => {
    console.info(`Message publie sur ${topic}`);
    client.end();
  });
});
