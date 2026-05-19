import mqtt from 'mqtt';

const mqttUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883';
const topic = process.env.MQTT_SENSOR_TOPIC ?? 'cuverie/+/readings';
const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000/api';
const ingestionSecret = process.env.SENSOR_INGESTION_SECRET;

const client = mqtt.connect(mqttUrl);

client.on('connect', () => {
  console.info(`MQTT bridge connecte a ${mqttUrl}, abonnement ${topic}`);
  client.subscribe(topic);
});

client.on('message', async (_topic, payload) => {
  try {
    const body = JSON.parse(payload.toString()) as unknown;
    const response = await fetch(`${apiBaseUrl}/sensors/ingest`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(ingestionSecret ? { 'x-ingestion-secret': ingestionSecret } : {})
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error(`Ingestion refusee: ${response.status} ${await response.text()}`);
    }
  } catch (error) {
    console.error('Message MQTT invalide', error);
  }
});
