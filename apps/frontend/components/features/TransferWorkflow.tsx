"use client";

import type { Tank, TransferOrder } from "@cuverie/shared";
import { approveTransferOrder, executeTransferOrder } from "@cuverie/shared";
import { FiCheck, FiPlay } from "react-icons/fi";
import { useApp } from "../../app/AppProviders";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const statusLabel: Record<TransferOrder["status"], string> = {
  draft: "brouillon",
  pending_approval: "a approuver",
  approved: "approuve",
  executing: "execution",
  completed: "termine",
  cancelled: "annule",
  rejected: "rejete"
};

export const TransferWorkflow = ({ orders, tanks }: { orders: TransferOrder[]; tanks: Tank[] }) => {
  const {
    state: { profile },
    actions: { updateTransfer, setTanks, setTraceabilityEvents, setAuditLogs, markSaving }
  } = useApp();

  if (!profile) return null;

  return (
    <div className="grid gap-3">
      {orders.map((order) => {
        const source = tanks.find((tank) => tank.id === order.sourceTankId);
        const target = tanks.find((tank) => tank.id === order.targetTankId);
        return (
          <div key={order.id} className="grid gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[13px] font-bold text-[var(--ink)]">{order.code}</span>
                <Badge variant={order.status === "completed" ? "ok" : order.status === "pending_approval" ? "warn" : "inactive"}>
                  {statusLabel[order.status]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-[var(--mid)]">
                {source?.code ?? "source"} vers {target?.code ?? "cible"} - {order.requestedVolumeLiters.toLocaleString("fr-FR")} L
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                icon={<FiCheck size={14} />}
                disabled={order.status !== "pending_approval"}
                onClick={() => {
                  const nowIso = new Date().toISOString();
                  const approved = approveTransferOrder(order, {
                    id: profile.id,
                    email: profile.email,
                    role: profile.role,
                    siteIds: profile.siteIds
                  }, nowIso);
                  updateTransfer(approved);
                  setAuditLogs((prev) => [
                    {
                      id: `${order.id}:audit:approve:${nowIso}`,
                      siteId: order.siteId,
                      actorId: profile.id,
                      action: "transfer.approve",
                      entityType: "transfer_order",
                      entityId: order.id,
                      before: { status: order.status },
                      after: { status: approved.status },
                      occurredAt: nowIso,
                      createdAt: nowIso,
                      updatedAt: nowIso
                    },
                    ...prev
                  ]);
                  markSaving();
                }}
              >
                Approuver
              </Button>
              <Button
                size="sm"
                icon={<FiPlay size={14} />}
                disabled={order.status !== "approved" || !source || !target}
                onClick={() => {
                  if (!source || !target) return;
                  const nowIso = new Date().toISOString();
                  const result = executeTransferOrder(
                    order,
                    source,
                    target,
                    { id: profile.id, email: profile.email, role: profile.role, siteIds: profile.siteIds },
                    nowIso
                  );
                  updateTransfer(result.order);
                  setTanks((prev) =>
                    prev.map((tank) =>
                      tank.id === result.sourceTank.id ? result.sourceTank : tank.id === result.targetTank.id ? result.targetTank : tank
                    )
                  );
                  setTraceabilityEvents((prev) => [
                    ...result.traceabilityEvents.map((event) => ({
                      ...event,
                      sourceEntityId: source.code,
                      targetEntityId: target.code,
                      metadata: {
                        ...event.metadata,
                        sourceTankId: source.id,
                        targetTankId: target.id,
                        sourceTankCode: source.code,
                        targetTankCode: target.code
                      }
                    })),
                    ...prev
                  ]);
                  setAuditLogs((prev) => [
                    {
                      ...result.auditLog,
                      id: `${order.id}:audit:execute:${nowIso}`,
                      after: {
                        status: result.order.status,
                        sourceTank: source.code,
                        targetTank: target.code,
                        requestedVolumeLiters: order.requestedVolumeLiters
                      }
                    },
                    ...prev
                  ]);
                  markSaving();
                }}
              >
                Executer
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
