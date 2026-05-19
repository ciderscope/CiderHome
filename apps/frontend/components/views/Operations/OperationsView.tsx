"use client";

import { validateOperation } from "@cuverie/shared";
import { FiCheckCircle } from "react-icons/fi";
import { useApp } from "../../../app/AppProviders";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { EntityTable } from "../../ui/EntityTable";
import { ViewHeader, ViewShell } from "../../ui/ViewPrimitives";
import { Topbar } from "../../ui/Topbar";

const statusLabel: Record<string, string> = {
  draft: "Brouillon",
  assigned: "Assignee",
  submitted: "Soumise",
  validated: "Validee",
  executed: "Executee",
  rejected: "Rejetee"
};

export const OperationsView = () => {
  const {
    state: { profile, visibleOperations, visibleWorkOrders },
    actions: { setOperations, setWorkOrders, setAuditLogs, markSaving }
  } = useApp();
  const actor = profile
    ? {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        siteIds: profile.siteIds
      }
    : null;

  return (
    <>
      <Topbar active="operations" />
      <ViewShell>
        <ViewHeader title="Operations de chai" subtitle="Planification, checklist operateur et validation responsable avant execution." />
        <Card title="Fiches de travail" eyebrow="Workflow deux niveaux">
          <div className="grid gap-3 md:grid-cols-2">
            {visibleWorkOrders.map((workOrder) => (
              <article key={workOrder.id} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper2)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-semibold text-[var(--primary)]">{workOrder.code}</p>
                    <h2 className="mt-1 text-base font-bold text-[var(--ink)]">{workOrder.title}</h2>
                  </div>
                  <Badge variant={workOrder.status === "submitted" ? "warn" : "ok"}>{statusLabel[workOrder.status] ?? workOrder.status}</Badge>
                </div>
                <ul className="mt-3 grid gap-2 text-sm text-[var(--mid)]">
                  {workOrder.checklist.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${item.checked ? "bg-[var(--primary)]" : "bg-[var(--border-strong)]"}`} />
                      {item.label}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button
                    size="sm"
                    icon={<FiCheckCircle size={14} />}
                    disabled={workOrder.status !== "submitted" || !actor}
                    onClick={() => {
                      if (!actor) return;
                      const nowIso = new Date().toISOString();
                      const operation = visibleOperations.find((item) => item.id === workOrder.operationId);
                      if (operation?.status === "submitted") {
                        const result = validateOperation(operation, actor, nowIso);
                        setOperations((prev) => prev.map((item) => (item.id === result.operation.id ? result.operation : item)));
                        setAuditLogs((prev) => [result.auditLog, ...prev]);
                      }
                      setWorkOrders((prev) =>
                        prev.map((item) =>
                          item.id === workOrder.id
                            ? {
                                ...item,
                                status: "validated",
                                validatorId: actor.id,
                                updatedAt: nowIso
                              }
                            : item
                        )
                      );
                      markSaving();
                    }}
                  >
                    Valider
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Card>
        <Card title="Operations">
          <EntityTable
            rows={visibleOperations}
            columns={[
              { key: "type", label: "Type" },
              { key: "status", label: "Statut", render: (operation) => statusLabel[operation.status ?? "draft"] ?? operation.status },
              { key: "plannedAt", label: "Planifiee", render: (operation) => (operation.plannedAt ? new Date(operation.plannedAt).toLocaleString("fr-FR") : "-") },
              { key: "volumeDeltaLiters", label: "Volume", render: (operation) => `${operation.volumeDeltaLiters ?? 0} L` }
            ]}
          />
        </Card>
      </ViewShell>
    </>
  );
};
