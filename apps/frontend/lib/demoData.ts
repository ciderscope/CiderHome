import type {
  Alert,
  Analysis,
  AuditLog,
  HarvestReceipt,
  Lot,
  Operation,
  Site,
  StockItem,
  Tank,
  TraceabilityEvent,
  TransferOrder,
  UserProfile,
  WorkOrder
} from "@cuverie/shared";

export const now = "2026-05-18T09:00:00.000Z";
const primarySiteId = "11111111-1111-4111-8111-111111111111";
const secondarySiteId = "22222222-2222-4222-8222-222222222222";
const managerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const operatorId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const sourceTankId = "33333333-3333-4333-8333-333333333333";
const targetTankId = "55555555-5555-4555-8555-555555555555";
const availableTankId = "77777777-7777-4777-8777-777777777777";
const lotId = "66666666-6666-4666-8666-666666666666";

export const demoSites: Site[] = [
  {
    id: primarySiteId,
    name: "Atelier Val de Rance",
    code: "VDR",
    address: "Bretagne",
    active: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: secondarySiteId,
    name: "Chai du Bocage",
    code: "BOC",
    address: "Normandie",
    active: true,
    createdAt: now,
    updatedAt: now
  }
];

export const demoUser: UserProfile = {
  id: managerId,
  email: "responsable@cuverie.test",
  fullName: "Camille Le Goff",
  role: "cellar_manager",
  defaultSiteId: primarySiteId,
  siteIds: [primarySiteId, secondarySiteId],
  active: true,
  createdAt: now,
  updatedAt: now
};

export const demoOperator: UserProfile = {
  id: operatorId,
  email: "operateur@cuverie.test",
  fullName: "Noe Martin",
  role: "operator",
  defaultSiteId: primarySiteId,
  siteIds: [primarySiteId],
  active: true,
  createdAt: now,
  updatedAt: now
};

export const demoTanks: Tank[] = [
  {
    id: sourceTankId,
    siteId: primarySiteId,
    code: "C-01",
    name: "Cuve C-01",
    capacityLiters: 10000,
    usefulCapacityLiters: 9500,
    currentVolumeLiters: 7200,
    temperatureC: 13.4,
    temperatureMinC: 10,
    temperatureMaxC: 16,
    contentLotId: lotId,
    status: "occupied",
    state: "fermentation",
    material: "inox",
    zone: "Nord",
    position: { x: 8, y: 16 },
    sensors: ["temp-c01", "ph-c01"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: targetTankId,
    siteId: primarySiteId,
    code: "C-02",
    name: "Cuve C-02",
    capacityLiters: 8000,
    usefulCapacityLiters: 7600,
    currentVolumeLiters: 1800,
    temperatureC: 11.9,
    temperatureMinC: 9,
    temperatureMaxC: 15,
    status: "occupied",
    state: "elevage",
    material: "inox",
    zone: "Nord",
    position: { x: 42, y: 18 },
    sensors: ["temp-c02"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: availableTankId,
    siteId: primarySiteId,
    code: "B-07",
    name: "Foudre B-07",
    capacityLiters: 6000,
    usefulCapacityLiters: 5600,
    currentVolumeLiters: 0,
    temperatureC: 12.2,
    status: "available",
    state: "vide",
    material: "bois",
    zone: "Sud",
    position: { x: 66, y: 56 },
    sensors: [],
    createdAt: now,
    updatedAt: now
  }
];

export const demoLots: Lot[] = [
  {
    id: lotId,
    siteId: primarySiteId,
    code: "LOT-2026-001",
    productType: "cidre",
    variety: "Douce Moen",
    harvestYear: 2025,
    status: "maturing",
    volumeLiters: 9200,
    origin: "Vergers partenaires",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    siteId: primarySiteId,
    code: "LOT-2026-002",
    productType: "jus",
    harvestYear: 2026,
    status: "in_progress",
    volumeLiters: 3600,
    origin: "Reception du 12/05",
    createdAt: now,
    updatedAt: now
  }
];

export const demoTransfers: TransferOrder[] = [
  {
    id: "99999999-9999-4999-8999-999999999999",
    siteId: primarySiteId,
    code: "OT-2026-014",
    sourceTankId,
    targetTankId,
    lotId,
    requestedVolumeLiters: 2500,
    status: "pending_approval",
    requestedBy: operatorId,
    requestedAt: now,
    createdAt: now,
    updatedAt: now
  }
];

export const demoAnalyses: Analysis[] = [
  {
    id: "12121212-1212-4121-8121-121212121212",
    siteId: primarySiteId,
    lotId,
    tankId: sourceTankId,
    sampleCode: "ECH-C01-0518",
    measuredAt: now,
    analystId: managerId,
    results: { ph: 3.55, densite: 1.018, temperatureC: 13.4 },
    compliant: true,
    createdAt: now,
    updatedAt: now
  }
];

export const demoTraceabilityEvents: TraceabilityEvent[] = [
  {
    id: "trace-1",
    siteId: primarySiteId,
    type: "transfer_executed",
    lotId,
    sourceEntityType: "lot",
    sourceEntityId: "LOT-2026-001",
    targetEntityType: "tank",
    targetEntityId: "C-01",
    quantityLiters: 7200,
    occurredAt: now,
    actorId: managerId,
    metadata: { lotId, tankId: sourceTankId },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "trace-2",
    siteId: primarySiteId,
    type: "analysis_recorded",
    lotId,
    sourceEntityType: "tank",
    sourceEntityId: "C-01",
    targetEntityType: "sample",
    targetEntityId: "ECH-C01-0518",
    quantityLiters: 0.25,
    occurredAt: now,
    actorId: managerId,
    metadata: { analysisId: "12121212-1212-4121-8121-121212121212", lotCode: "LOT-2026-001", tankId: sourceTankId },
    createdAt: now,
    updatedAt: now
  }
];

export const demoAuditLogs: AuditLog[] = [
  {
    id: "audit-analysis-1",
    siteId: primarySiteId,
    actorId: managerId,
    action: "analysis.create",
    entityType: "analysis",
    entityId: "12121212-1212-4121-8121-121212121212",
    after: { sampleCode: "ECH-C01-0518", lotCode: "LOT-2026-001", tankCode: "C-01" },
    occurredAt: now,
    createdAt: now,
    updatedAt: now
  }
];

export const demoHarvestReceipts: HarvestReceipt[] = [
  {
    id: "13131313-1313-4131-8131-131313131313",
    siteId: primarySiteId,
    lotId,
    receiptNumber: "REC-2026-018",
    parcel: "Parcelle des Hauts Vergers",
    grapeVariety: "Douce Moen",
    supplier: "Domaine Keravel",
    weightKg: 12800,
    maturity: { sugarBrix: 13.8, ph: 3.42, acidityGl: 4.6, sanitaryState: "good" },
    receivedAt: "2026-05-17T07:45:00.000Z",
    assignedTankId: sourceTankId,
    documentIds: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "14141414-1414-4141-8141-141414141414",
    siteId: primarySiteId,
    receiptNumber: "REC-2026-019",
    parcel: "Clos du Sud",
    grapeVariety: "Avrolles",
    supplier: "Coop Bocage",
    weightKg: 6100,
    maturity: { sugarBrix: 12.5, ph: 3.5, sanitaryState: "watch" },
    receivedAt: "2026-05-18T06:15:00.000Z",
    assignedTankId: availableTankId,
    documentIds: [],
    createdAt: now,
    updatedAt: now
  }
];

export const demoOperations: Operation[] = [
  {
    id: "15151515-1515-4151-8151-151515151515",
    siteId: primarySiteId,
    type: "prise_densite_temperature",
    status: "submitted",
    lotId,
    tankId: sourceTankId,
    operatorId,
    assigneeId: operatorId,
    plannedAt: "2026-05-18T10:00:00.000Z",
    startedAt: "2026-05-18T10:10:00.000Z",
    volumeDeltaLiters: 0,
    checklist: [
      { id: "temp", label: "Temperature relevee", required: true, checked: true },
      { id: "densite", label: "Densite relevee", required: true, checked: true }
    ],
    notes: "Fermentation reguliere",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "16161616-1616-4161-8161-161616161616",
    siteId: primarySiteId,
    type: "nettoyage",
    status: "assigned",
    tankId: availableTankId,
    operatorId,
    assigneeId: operatorId,
    plannedAt: "2026-05-18T15:30:00.000Z",
    startedAt: "2026-05-18T15:30:00.000Z",
    checklist: [
      { id: "rinse", label: "Rincage alcalin", required: true, checked: false },
      { id: "control", label: "Controle visuel", required: true, checked: false }
    ],
    createdAt: now,
    updatedAt: now
  }
];

export const demoWorkOrders: WorkOrder[] = [
  {
    id: "17171717-1717-4171-8171-171717171717",
    siteId: primarySiteId,
    operationId: "15151515-1515-4151-8151-151515151515",
    code: "FT-2026-032",
    title: "Controle fermentation C-01",
    status: "submitted",
    assigneeId: operatorId,
    dueAt: "2026-05-18T12:00:00.000Z",
    checklist: [
      { id: "density", label: "Densite saisie", required: true, checked: true },
      { id: "temp", label: "Temperature saisie", required: true, checked: true }
    ],
    requiredFields: ["density", "temperatureC"],
    createdAt: now,
    updatedAt: now
  }
];

export const demoStockItems: StockItem[] = [
  {
    id: "18181818-1818-4181-8181-181818181818",
    siteId: primarySiteId,
    name: "Levure aromatique",
    category: "levure",
    supplier: "OenoLab",
    batchNumber: "LV-2604",
    quantity: 8.5,
    unit: "kg",
    minQuantity: 5,
    expiryDate: "2026-11-30",
    location: "Magasin froid",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "19191919-1919-4191-8191-191919191919",
    siteId: primarySiteId,
    name: "SO2 solution",
    category: "sulfite",
    supplier: "QualiChai",
    batchNumber: "SO2-1206",
    quantity: 3,
    unit: "l",
    minQuantity: 4,
    expiryDate: "2026-09-15",
    location: "Armoire securisee",
    createdAt: now,
    updatedAt: now
  }
];

export const demoAlerts: Alert[] = [
  {
    id: "alert-temp-c01",
    siteId: primarySiteId,
    entityType: "tank",
    entityId: sourceTankId,
    severity: "warning",
    message: "Temperature C-01 proche de la consigne haute",
    status: "open",
    triggeredAt: now,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "alert-stock-so2",
    siteId: primarySiteId,
    entityType: "stock",
    entityId: "19191919-1919-4191-8191-191919191919",
    severity: "warning",
    message: "Stock SO2 sous seuil minimal",
    status: "open",
    triggeredAt: now,
    createdAt: now,
    updatedAt: now
  }
];
