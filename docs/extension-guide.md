# Guide D'Extension

## Capteurs

HTTP:

```bash
npm run dev:api
npx tsx scripts/sensors/simulate-http.ts
```

Chaque lecture est validee par `packages/shared/schemas/sensor-reading.schema.json`, inseree dans `sensor_readings`, puis evaluee par `evaluateSensorReading` et les `alert_rules` actives. L'alias REST compatible integration ERP/IoT est aussi disponible: `POST /api/iot/events`.

MQTT:

```bash
MQTT_URL=mqtt://localhost:1883 npm run mqtt:bridge -w @cuverie/api
npx tsx scripts/sensors/simulate-mqtt.ts
```

Le bridge convertit les messages MQTT en POST `/api/sensors/ingest`. Pour la production, deployer ce bridge comme service long-running distinct des fonctions Vercel.

## Multi-site

- Toute entite metier porte `siteId` cote TypeScript et `site_id` cote Postgres.
- Les profils portent `site_ids`.
- Les services critiques utilisent `assertActorCanUseEntities`.
- Les routes collection acceptent `?siteId=` et filtrent automatiquement sur les sites autorises.

## Tracabilite

Les evenements sont ajoutes dans `traceability_events` lors des operations et transferts. Le moteur `searchTraceability` parcourt le graphe en ascendant ou descendant. Les regles metier peuvent etre etendues en ajoutant des `TraceabilityEventType` et des generateurs d'evenements dans `packages/shared/src/services`.

## Reception Et Affectation

Les receptions vendange utilisent `HarvestReceipt` et `suggestTankForHarvest`. La proposition se base sur le poids receptionne, un rendement liquide configurable et la capacite utile des cuves disponibles.

## Stocks

Les mouvements passent par `applyStockMovement` pour garantir un stock non negatif, produire un audit log et signaler le passage sous seuil. Les sorties peuvent porter `operationId`, `lotId` et `tankId` pour lier l'usage produit a la tracabilite.
