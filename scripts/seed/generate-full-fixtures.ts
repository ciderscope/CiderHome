import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "fixtures-full");
const now = "2026-05-18T09:00:00.000Z";
const siteA = "11111111-1111-4111-8111-111111111111";
const siteB = "22222222-2222-4222-8222-222222222222";
const managerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const operatorId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const adminId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const qualityId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const operator2Id = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

type JsonRecord = Record<string, unknown>;

function uuid(prefix: string, index: number): string {
  return `${prefix}${String(index).padStart(7, "0")}-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

function lotId(index: number): string {
  return uuid("6", index);
}

function tankId(index: number): string {
  return uuid("3", index);
}

function operationId(index: number): string {
  return uuid("4", index);
}

async function writeJson(name: string, rows: JsonRecord[]) {
  await writeFile(join(outDir, `${name}.json`), `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

const sites = [
  { id: siteA, name: "Atelier Val de Rance", code: "VDR", address: "Bretagne", active: true, createdAt: now, updatedAt: now },
  { id: siteB, name: "Chai du Bocage", code: "BOC", address: "Normandie", active: true, createdAt: now, updatedAt: now }
];

const users = [
  { id: managerId, email: "responsable@cuverie.test", password: "ChangeMe-2026!", fullName: "Camille Le Goff", role: "cellar_manager", defaultSiteId: siteA, siteIds: [siteA, siteB], active: true, createdAt: now, updatedAt: now },
  { id: operatorId, email: "operateur@cuverie.test", password: "ChangeMe-2026!", fullName: "Noe Martin", role: "operator", defaultSiteId: siteA, siteIds: [siteA], active: true, createdAt: now, updatedAt: now },
  { id: adminId, email: "admin@cuverie.test", password: "ChangeMe-2026!", fullName: "Sarah Delaunay", role: "admin", defaultSiteId: siteA, siteIds: [siteA, siteB], active: true, createdAt: now, updatedAt: now },
  { id: qualityId, email: "qualite@cuverie.test", password: "ChangeMe-2026!", fullName: "Yann Bourhis", role: "quality_technician", defaultSiteId: siteA, siteIds: [siteA], active: true, createdAt: now, updatedAt: now },
  { id: operator2Id, email: "operateur2@cuverie.test", password: "ChangeMe-2026!", fullName: "Lina Moreau", role: "operator", defaultSiteId: siteB, siteIds: [siteB], active: true, createdAt: now, updatedAt: now }
];

const lots = Array.from({ length: 10 }, (_, index) => ({
  id: lotId(index + 1),
  siteId: index < 8 ? siteA : siteB,
  code: `LOT-2026-${String(index + 1).padStart(3, "0")}`,
  productType: index % 3 === 0 ? "vin" : "cidre",
  variety: ["Douce Moen", "Avrolles", "Guillevic", "Chardonnay"][index % 4],
  harvestYear: 2026,
  status: index % 4 === 0 ? "in_progress" : "maturing",
  volumeLiters: 4500 + index * 650,
  origin: `Parcelle demo ${index + 1}`,
  createdAt: now,
  updatedAt: now
}));

const tanks = Array.from({ length: 40 }, (_, index) => {
  const tankNumber = index + 1;
  const capacity = 4000 + (tankNumber % 8) * 1500;
  const lot = lots[index % lots.length];
  const occupied = tankNumber % 5 !== 0;
  return {
    id: tankId(tankNumber),
    siteId: tankNumber <= 32 ? siteA : siteB,
    code: `C-${String(tankNumber).padStart(2, "0")}`,
    name: `Cuve C-${String(tankNumber).padStart(2, "0")}`,
    capacityLiters: capacity,
    usefulCapacityLiters: Math.round(capacity * 0.95),
    currentVolumeLiters: occupied ? Math.round(capacity * (0.35 + (tankNumber % 5) * 0.1)) : 0,
    temperatureC: 10 + (tankNumber % 9),
    temperatureMinC: 9,
    temperatureMaxC: 18,
    contentLotId: occupied ? lot.id : undefined,
    status: occupied ? "occupied" : "available",
    state: occupied ? (tankNumber % 2 === 0 ? "fermentation" : "elevage") : "vide",
    material: ["inox", "beton", "bois", "fibre", "amphore"][tankNumber % 5],
    zone: tankNumber <= 20 ? "Nord" : "Sud",
    position: { x: (tankNumber * 13) % 88, y: (tankNumber * 17) % 76 },
    sensors: [`temp-c${tankNumber}`],
    qrCode: `TANK-C-${String(tankNumber).padStart(2, "0")}`,
    createdAt: now,
    updatedAt: now
  };
});

const operations = Array.from({ length: 50 }, (_, index) => {
  const opNumber = index + 1;
  const lot = lots[index % lots.length];
  const tank = tanks[index % tanks.length];
  return {
    id: operationId(opNumber),
    siteId: tank.siteId,
    type: ["reception", "remplissage", "prise_densite_temperature", "soutirage", "nettoyage"][opNumber % 5],
    status: ["draft", "submitted", "validated", "executed"][opNumber % 4],
    lotId: lot.id,
    tankId: tank.id,
    operatorId: opNumber % 3 === 0 ? operator2Id : operatorId,
    assigneeId: opNumber % 3 === 0 ? operator2Id : operatorId,
    plannedAt: `2026-05-${String(1 + (opNumber % 18)).padStart(2, "0")}T08:00:00.000Z`,
    startedAt: `2026-05-${String(1 + (opNumber % 18)).padStart(2, "0")}T09:00:00.000Z`,
    volumeDeltaLiters: opNumber % 5 === 0 ? 0 : 400 + opNumber * 12,
    checklist: [
      { id: "safety", label: "EPI controles", required: true, checked: true },
      { id: "measure", label: "Mesure saisie", required: true, checked: opNumber % 7 !== 0 }
    ],
    notes: `Operation demo ${opNumber}`,
    createdAt: now,
    updatedAt: now
  };
});

const analyses = Array.from({ length: 20 }, (_, index) => {
  const tank = tanks[index % tanks.length];
  return {
    id: uuid("a", index + 1),
    siteId: tank.siteId,
    lotId: tank.contentLotId ?? lots[index % lots.length].id,
    tankId: tank.id,
    sampleCode: `ECH-${String(index + 1).padStart(3, "0")}`,
    measuredAt: `2026-05-${String(1 + (index % 18)).padStart(2, "0")}T11:00:00.000Z`,
    analystId: qualityId,
    results: { ph: 3.3 + (index % 6) / 10, density: 1.01 + (index % 8) / 1000, so2Free: 18 + index },
    compliant: index % 9 !== 0,
    comments: "Analyse demo",
    createdAt: now,
    updatedAt: now
  };
});

const harvestReceipts = lots.map((lot, index) => ({
  id: uuid("b", index + 1),
  siteId: lot.siteId,
  lotId: lot.id,
  receiptNumber: `REC-2026-${String(index + 1).padStart(3, "0")}`,
  parcel: String(lot.origin),
  grapeVariety: String(lot.variety),
  supplier: "Domaine partenaire",
  weightKg: 6000 + index * 850,
  maturity: { sugarBrix: 12.5 + (index % 4), ph: 3.35 + (index % 3) / 10, sanitaryState: index % 7 === 0 ? "watch" : "good" },
  receivedAt: `2026-05-${String(1 + index).padStart(2, "0")}T07:30:00.000Z`,
  assignedTankId: tankId(index + 1),
  documentIds: [],
  createdAt: now,
  updatedAt: now
}));

const stockItems = [
  { id: uuid("c", 1), siteId: siteA, name: "Levure aromatique", category: "levure", supplier: "OenoLab", batchNumber: "LV-2604", quantity: 8.5, unit: "kg", minQuantity: 5, expiryDate: "2026-11-30", location: "Magasin froid", createdAt: now, updatedAt: now },
  { id: uuid("c", 2), siteId: siteA, name: "SO2 solution", category: "sulfite", supplier: "QualiChai", batchNumber: "SO2-1206", quantity: 3, unit: "l", minQuantity: 4, expiryDate: "2026-09-15", location: "Armoire securisee", createdAt: now, updatedAt: now }
];

const traceabilityEvents = operations.map((operation, index) => ({
  id: `trace-operation-${index + 1}`,
  siteId: operation.siteId,
  type: "operation_recorded",
  lotId: operation.lotId,
  sourceEntityType: "operation",
  sourceEntityId: operation.id,
  targetEntityType: "tank",
  targetEntityId: operation.tankId,
  quantityLiters: operation.volumeDeltaLiters,
  occurredAt: operation.startedAt,
  actorId: operation.operatorId,
  metadata: { operationType: operation.type },
  createdAt: now,
  updatedAt: now
}));

async function main() {
  await mkdir(outDir, { recursive: true });
  await writeJson("sites", sites);
  await writeJson("users", users);
  await writeJson("lots", lots);
  await writeJson("tanks", tanks);
  await writeJson("harvest-receipts", harvestReceipts);
  await writeJson("sub-lot-samples", lots.map((lot, index) => ({ id: uuid("d", index + 1), siteId: lot.siteId, lotId: lot.id, code: `${lot.code}-SL1`, kind: "sous_lot", volumeLiters: 1000, status: "active", createdAt: now, updatedAt: now })));
  await writeJson("operations", operations);
  await writeJson("work-orders", operations.slice(0, 12).map((operation, index) => ({ id: uuid("e", index + 1), siteId: operation.siteId, operationId: operation.id, code: `FT-2026-${String(index + 1).padStart(3, "0")}`, title: `Fiche ${operation.type}`, status: operation.status === "executed" ? "done" : "submitted", assigneeId: operation.operatorId, dueAt: operation.plannedAt, checklist: operation.checklist, requiredFields: ["temperatureC", "density"], createdAt: now, updatedAt: now })));
  await writeJson("inputs", []);
  await writeJson("stock-items", stockItems);
  await writeJson("stock-movements", [{ id: uuid("f", 1), siteId: siteA, stockItemId: stockItems[1]?.id, operationId: operationId(1), lotId: lotId(1), tankId: tankId(1), direction: "out", quantity: 1, unit: "l", reason: "Correction SO2", movedAt: now, actorId: managerId, createdAt: now, updatedAt: now }]);
  await writeJson("analyses", analyses);
  await writeJson("document-attachments", harvestReceipts.slice(0, 5).map((receipt, index) => ({ id: uuid("7", index + 1), siteId: receipt.siteId, entityType: "harvest_receipt", entityId: receipt.id, filename: `${receipt.receiptNumber}.pdf`, storagePath: `receipts/2026/${receipt.receiptNumber}.pdf`, mimeType: "application/pdf", sizeBytes: 120000 + index, uploadedBy: managerId, createdAt: now, updatedAt: now })));
  await writeJson("transfer-orders", Array.from({ length: 5 }, (_, index) => ({ id: uuid("9", index + 1), siteId: siteA, code: `OT-2026-${String(index + 1).padStart(3, "0")}`, sourceTankId: tankId(index + 1), targetTankId: tankId(index + 6), lotId: lotId(index + 1), requestedVolumeLiters: 500 + index * 100, status: "pending_approval", requestedBy: operatorId, requestedAt: now, createdAt: now, updatedAt: now })));
  await writeJson("traceability-events", traceabilityEvents);
  await writeJson("sensor-readings", tanks.slice(0, 20).map((tank, index) => ({ id: uuid("8", index + 1), siteId: tank.siteId, sensorId: `temp-c${index + 1}`, tankId: tank.id, measuredAt: now, metrics: { temperatureC: tank.temperatureC, density: 1.015 + index / 1000, co2Gpl: 1 + index / 10 }, rawPayload: { demo: true }, createdAt: now, updatedAt: now })));
  await writeJson("alert-rules", [{ id: uuid("5", 1), siteId: siteA, name: "Temperature haute fermentation", scope: "tank", metric: "temperatureC", comparator: "gt", threshold: 18, enabled: true, channels: ["email"], createdAt: now, updatedAt: now }]);
  await writeJson("alerts", [{ id: "alert-stock-so2", siteId: siteA, entityType: "stock", entityId: stockItems[1]?.id, severity: "warning", message: "Stock SO2 sous seuil minimal", status: "open", triggeredAt: now, createdAt: now, updatedAt: now }]);
  await writeJson("bottling-batches", [{ id: uuid("2", 1), siteId: siteA, code: "MB-2026-001", lotId: lotId(1), volumeLiters: 0, bottleCount: 0, status: "planned", createdAt: now, updatedAt: now }]);
  await writeJson("audit-logs", []);
  console.info(`Fixtures completes generees dans ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
