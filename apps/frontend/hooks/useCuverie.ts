"use client";

import { useCallback, useMemo, useState } from "react";
import type { AppMode, SaveStatus } from "../types";
import type { Alert, Analysis, AuditLog, HarvestReceipt, Lot, Operation, Site, StockItem, Tank, TraceabilityEvent, TransferOrder, UserProfile, WorkOrder } from "@cuverie/shared";
import {
  demoAlerts,
  demoAnalyses,
  demoAuditLogs,
  demoHarvestReceipts,
  demoLots,
  demoOperations,
  demoSites,
  demoStockItems,
  demoTanks,
  demoTraceabilityEvents,
  demoTransfers,
  demoUser,
  demoWorkOrders
} from "../lib/demoData";
import { getSupabase } from "../lib/supabase";

export const APP_MODES = [
  "dashboard",
  "cuverie",
  "reception",
  "operations",
  "lots",
  "analyses",
  "stocks",
  "transferts",
  "tracabilite",
  "rapports",
  "admin"
] as const;

type CreateTankInput = {
  code: string;
  name: string;
  capacityLiters: number;
  usefulCapacityLiters?: number;
  currentVolumeLiters: number;
  material: Tank["material"];
  zone: string;
  state: NonNullable<Tank["state"]>;
  contentLotId?: string;
};

type CreateAnalysisInput = {
  sampleCode: string;
  measuredAt?: string;
  lotId?: string;
  tankId?: string;
  results: Analysis["results"];
  compliant: boolean;
  comments?: string;
};

type CreateTransferOrderInput = {
  sourceTankId: string;
  targetTankId: string;
  requestedVolumeLiters: number;
};

type CreateHarvestReceiptInput = {
  parcel: string;
  grapeVariety: string;
  supplier?: string;
  weightKg: number;
  assignedTankId?: string;
};

const createLocalId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const nextTransferCode = (orders: TransferOrder[]) => {
  const year = new Date().getFullYear();
  const maxNumber = orders.reduce((max, order) => {
    const value = Number(order.code.match(/-(\d+)$/)?.[1] ?? 0);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `OT-${year}-${String(maxNumber + 1).padStart(3, "0")}`;
};

const nextReceiptNumber = (receipts: HarvestReceipt[]) => {
  const year = new Date().getFullYear();
  const maxNumber = receipts.reduce((max, receipt) => {
    const value = Number(receipt.receiptNumber.match(/-(\d+)$/)?.[1] ?? 0);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `REC-${year}-${String(maxNumber + 1).padStart(3, "0")}`;
};

export const useCuverie = () => {
  const [mode, setMode] = useState<AppMode>("dashboard");
  const [sites] = useState<Site[]>(demoSites);
  const [currentSiteId, setCurrentSiteId] = useState<string>(demoSites[0]!.id);
  const [profile, setProfile] = useState<UserProfile | null>(demoUser);
  const [tanks, setTanks] = useState<Tank[]>(demoTanks);
  const [lots, setLots] = useState<Lot[]>(demoLots);
  const [harvestReceipts, setHarvestReceipts] = useState<HarvestReceipt[]>(demoHarvestReceipts);
  const [operations, setOperations] = useState<Operation[]>(demoOperations);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(demoWorkOrders);
  const [analyses, setAnalyses] = useState<Analysis[]>(demoAnalyses);
  const [stockItems, setStockItems] = useState<StockItem[]>(demoStockItems);
  const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);
  const [transferOrders, setTransferOrders] = useState<TransferOrder[]>(demoTransfers);
  const [traceabilityEvents, setTraceabilityEvents] = useState<TraceabilityEvent[]>(demoTraceabilityEvents);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(demoAuditLogs);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [online, setOnline] = useState(true);

  const currentSite = useMemo(
    () => sites.find((site) => site.id === currentSiteId) ?? sites[0]!,
    [currentSiteId, sites]
  );

  const visibleTanks = useMemo(() => tanks.filter((tank) => tank.siteId === currentSiteId), [tanks, currentSiteId]);
  const visibleLots = useMemo(() => lots.filter((lot) => lot.siteId === currentSiteId), [lots, currentSiteId]);
  const visibleHarvestReceipts = useMemo(
    () => harvestReceipts.filter((receipt) => receipt.siteId === currentSiteId),
    [harvestReceipts, currentSiteId]
  );
  const visibleOperations = useMemo(
    () => operations.filter((operation) => operation.siteId === currentSiteId),
    [operations, currentSiteId]
  );
  const visibleWorkOrders = useMemo(
    () => workOrders.filter((workOrder) => workOrder.siteId === currentSiteId),
    [workOrders, currentSiteId]
  );
  const visibleAnalyses = useMemo(
    () => analyses.filter((analysis) => analysis.siteId === currentSiteId),
    [analyses, currentSiteId]
  );
  const visibleStockItems = useMemo(
    () => stockItems.filter((item) => item.siteId === currentSiteId),
    [stockItems, currentSiteId]
  );
  const visibleAlerts = useMemo(() => alerts.filter((alert) => alert.siteId === currentSiteId), [alerts, currentSiteId]);
  const visibleTransfers = useMemo(
    () => transferOrders.filter((order) => order.siteId === currentSiteId),
    [transferOrders, currentSiteId]
  );
  const visibleTraceabilityEvents = useMemo(
    () => traceabilityEvents.filter((event) => event.siteId === currentSiteId),
    [traceabilityEvents, currentSiteId]
  );
  const visibleAuditLogs = useMemo(() => auditLogs.filter((log) => log.siteId === currentSiteId), [auditLogs, currentSiteId]);

  const moveTank = useCallback((tankId: string, position: { x: number; y: number }) => {
    const nowIso = new Date().toISOString();
    const tank = tanks.find((item) => item.id === tankId);
    setTanks((prev) => prev.map((tank) => (tank.id === tankId ? { ...tank, position } : tank)));
    if (!tank) return;

    setTraceabilityEvents((prev) => [
      {
        id: `${tankId}:trace:move:${nowIso}`,
        siteId: tank.siteId,
        type: "manual_adjustment",
        sourceEntityType: "tank",
        sourceEntityId: tank.code,
        targetEntityType: "location",
        targetEntityId: `${tank.zone} (${Math.round(position.x)},${Math.round(position.y)})`,
        occurredAt: nowIso,
        actorId: profile?.id ?? "local-user",
        metadata: { action: "tank.moved", tankId, before: tank.position, after: position },
        createdAt: nowIso,
        updatedAt: nowIso
      },
      ...prev
    ]);
    setAuditLogs((prev) => [
      {
        id: `${tankId}:audit:move:${nowIso}`,
        siteId: tank.siteId,
        actorId: profile?.id ?? "local-user",
        action: "tank.move",
        entityType: "tank",
        entityId: tankId,
        before: tank.position,
        after: position,
        occurredAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso
      },
      ...prev
    ]);
  }, [profile?.id, tanks]);

  const updateTransfer = useCallback((order: TransferOrder) => {
    setTransferOrders((prev) => prev.map((item) => (item.id === order.id ? order : item)));
  }, []);

  const createTank = useCallback(
    (input: CreateTankInput) => {
      const nowIso = new Date().toISOString();
      const tank: Tank = {
        id: createLocalId("tank"),
        siteId: currentSiteId,
        code: input.code.trim(),
        name: input.name.trim(),
        capacityLiters: input.capacityLiters,
        usefulCapacityLiters: input.usefulCapacityLiters,
        currentVolumeLiters: input.currentVolumeLiters,
        contentLotId: input.contentLotId || undefined,
        status: input.currentVolumeLiters > 0 ? "occupied" : "available",
        state: input.state,
        material: input.material,
        zone: input.zone.trim() || "Non affectee",
        position: { x: 12 + (tanks.length % 4) * 18, y: 18 + Math.floor(tanks.length / 4) * 18 },
        sensors: [],
        createdAt: nowIso,
        updatedAt: nowIso
      };

      setTanks((prev) => [tank, ...prev]);
      setTraceabilityEvents((prev) => [
        {
          id: `${tank.id}:trace:create`,
          siteId: currentSiteId,
          type: "manual_adjustment",
          sourceEntityType: "site",
          sourceEntityId: currentSite.code,
          targetEntityType: "tank",
          targetEntityId: tank.code,
          quantityLiters: tank.currentVolumeLiters,
          occurredAt: nowIso,
          actorId: profile?.id ?? "local-user",
          metadata: { action: "tank.created", tankId: tank.id, lotId: tank.contentLotId },
          createdAt: nowIso,
          updatedAt: nowIso
        },
        ...prev
      ]);
      setAuditLogs((prev) => [
        {
          id: `${tank.id}:audit:create`,
          siteId: currentSiteId,
          actorId: profile?.id ?? "local-user",
          action: "tank.create",
          entityType: "tank",
          entityId: tank.id,
          after: { code: tank.code, capacityLiters: tank.capacityLiters, currentVolumeLiters: tank.currentVolumeLiters },
          occurredAt: nowIso,
          createdAt: nowIso,
          updatedAt: nowIso
        },
        ...prev
      ]);

      return tank;
    },
    [currentSite.code, currentSiteId, profile?.id, tanks.length]
  );

  const createAnalysis = useCallback(
    (input: CreateAnalysisInput) => {
      const nowIso = new Date().toISOString();
      const lot = lots.find((item) => item.id === input.lotId);
      const tank = tanks.find((item) => item.id === input.tankId);
      const analysis: Analysis = {
        id: createLocalId("analysis"),
        siteId: currentSiteId,
        lotId: lot?.id,
        tankId: tank?.id,
        sampleCode: input.sampleCode.trim(),
        measuredAt: input.measuredAt || nowIso,
        analystId: profile?.id ?? "local-user",
        results: input.results,
        compliant: input.compliant,
        comments: input.comments?.trim() || undefined,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      const baseTraceability = {
        siteId: currentSiteId,
        type: "analysis_recorded" as const,
        lotId: lot?.id,
        targetEntityType: "sample",
        targetEntityId: analysis.sampleCode,
        quantityLiters: 0.25,
        occurredAt: analysis.measuredAt,
        actorId: analysis.analystId,
        metadata: { analysisId: analysis.id, lotCode: lot?.code, tankCode: tank?.code },
        createdAt: nowIso,
        updatedAt: nowIso
      };
      const events: TraceabilityEvent[] = [
        ...(lot
          ? [
              {
                ...baseTraceability,
                id: `${analysis.id}:trace:lot`,
                sourceEntityType: "lot",
                sourceEntityId: lot.code
              }
            ]
          : []),
        ...(tank
          ? [
              {
                ...baseTraceability,
                id: `${analysis.id}:trace:tank`,
                sourceEntityType: "tank",
                sourceEntityId: tank.code
              }
            ]
          : [])
      ];

      setAnalyses((prev) => [analysis, ...prev]);
      setTraceabilityEvents((prev) => [...events, ...prev]);
      setAuditLogs((prev) => [
        {
          id: `${analysis.id}:audit:create`,
          siteId: currentSiteId,
          actorId: analysis.analystId,
          action: "analysis.create",
          entityType: "analysis",
          entityId: analysis.id,
          after: { sampleCode: analysis.sampleCode, lotCode: lot?.code, tankCode: tank?.code, results: analysis.results },
          occurredAt: nowIso,
          createdAt: nowIso,
          updatedAt: nowIso
        },
        ...prev
      ]);

      return analysis;
    },
    [currentSiteId, lots, profile?.id, tanks]
  );

  const createTransferOrder = useCallback(
    (input: CreateTransferOrderInput) => {
      const source = tanks.find((tank) => tank.id === input.sourceTankId);
      const target = tanks.find((tank) => tank.id === input.targetTankId);
      if (!source || !target || source.id === target.id) {
        throw new Error("Selection de cuves invalide");
      }
      if (input.requestedVolumeLiters <= 0 || source.currentVolumeLiters < input.requestedVolumeLiters) {
        throw new Error("Volume source insuffisant");
      }
      if (target.capacityLiters - target.currentVolumeLiters < input.requestedVolumeLiters) {
        throw new Error("Capacite cible insuffisante");
      }

      const nowIso = new Date().toISOString();
      const canApproveTransfer = profile?.role === "admin" || profile?.role === "cellar_manager";
      const order: TransferOrder = {
        id: createLocalId("transfer"),
        siteId: currentSiteId,
        code: nextTransferCode(transferOrders),
        sourceTankId: source.id,
        targetTankId: target.id,
        lotId: source.contentLotId ?? lots.find((lot) => lot.siteId === currentSiteId)?.id ?? "",
        requestedVolumeLiters: input.requestedVolumeLiters,
        status: canApproveTransfer ? "approved" : "pending_approval",
        requestedBy: profile?.id ?? "local-user",
        approvedBy: canApproveTransfer ? profile?.id : undefined,
        requestedAt: nowIso,
        approvedAt: canApproveTransfer ? nowIso : undefined,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      setTransferOrders((prev) => [order, ...prev]);
      setAuditLogs((prev) => [
        {
          id: `${order.id}:audit:create`,
          siteId: currentSiteId,
          actorId: order.requestedBy,
          action: "transfer.create",
          entityType: "transfer_order",
          entityId: order.id,
          after: {
            code: order.code,
            status: order.status,
            sourceTank: source.code,
            targetTank: target.code,
            requestedVolumeLiters: order.requestedVolumeLiters
          },
          occurredAt: nowIso,
          createdAt: nowIso,
          updatedAt: nowIso
        },
        ...prev
      ]);

      return order;
    },
    [currentSiteId, lots, profile?.id, profile?.role, tanks, transferOrders]
  );

  const createHarvestReceipt = useCallback(
    (input: CreateHarvestReceiptInput) => {
      const nowIso = new Date().toISOString();
      const receipt: HarvestReceipt = {
        id: createLocalId("receipt"),
        siteId: currentSiteId,
        receiptNumber: nextReceiptNumber(harvestReceipts),
        parcel: input.parcel.trim(),
        grapeVariety: input.grapeVariety.trim(),
        supplier: input.supplier?.trim() || undefined,
        weightKg: input.weightKg,
        maturity: {},
        receivedAt: nowIso,
        assignedTankId: input.assignedTankId || undefined,
        documentIds: [],
        createdAt: nowIso,
        updatedAt: nowIso
      };

      setHarvestReceipts((prev) => [receipt, ...prev]);
      setAuditLogs((prev) => [
        {
          id: `${receipt.id}:audit:create`,
          siteId: currentSiteId,
          actorId: profile?.id ?? "local-user",
          action: "harvest_receipt.create",
          entityType: "harvest_receipt",
          entityId: receipt.id,
          after: {
            receiptNumber: receipt.receiptNumber,
            parcel: receipt.parcel,
            grapeVariety: receipt.grapeVariety,
            weightKg: receipt.weightKg
          },
          occurredAt: nowIso,
          createdAt: nowIso,
          updatedAt: nowIso
        },
        ...prev
      ]);

      return receipt;
    },
    [currentSiteId, harvestReceipts, profile?.id]
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const markSaving = useCallback(() => {
    setSaveStatus("saving");
    window.setTimeout(() => setSaveStatus("saved"), 350);
    window.setTimeout(() => setSaveStatus("idle"), 1600);
  }, []);

  const state = useMemo(
    () => ({
      mode,
      sites,
      currentSite,
      currentSiteId,
      profile,
      tanks,
      lots,
      harvestReceipts,
      operations,
      workOrders,
      analyses,
      stockItems,
      alerts,
      transferOrders,
      traceabilityEvents,
      auditLogs,
      visibleTanks,
      visibleLots,
      visibleHarvestReceipts,
      visibleOperations,
      visibleWorkOrders,
      visibleAnalyses,
      visibleStockItems,
      visibleAlerts,
      visibleTransfers,
      visibleTraceabilityEvents,
      visibleAuditLogs,
      saveStatus,
      online
    }),
    [
      mode,
      sites,
      currentSite,
      currentSiteId,
      profile,
      tanks,
      lots,
      harvestReceipts,
      operations,
      workOrders,
      analyses,
      stockItems,
      alerts,
      transferOrders,
      traceabilityEvents,
      auditLogs,
      visibleTanks,
      visibleLots,
      visibleHarvestReceipts,
      visibleOperations,
      visibleWorkOrders,
      visibleAnalyses,
      visibleStockItems,
      visibleAlerts,
      visibleTransfers,
      visibleTraceabilityEvents,
      visibleAuditLogs,
      saveStatus,
      online
    ]
  );

  const actions = useMemo(
    () => ({
      setMode,
      setCurrentSiteId,
      setProfile,
      setTanks,
      setLots,
      setHarvestReceipts,
      setOperations,
      setWorkOrders,
      setAnalyses,
      setStockItems,
      setAlerts,
      setTransferOrders,
      setTraceabilityEvents,
      setAuditLogs,
      setOnline,
      moveTank,
      updateTransfer,
      createTank,
      createAnalysis,
      createTransferOrder,
      createHarvestReceipt,
      markSaving,
      signOut
    }),
    [moveTank, updateTransfer, createTank, createAnalysis, createTransferOrder, createHarvestReceipt, markSaving, signOut]
  );

  return { state, actions };
};
