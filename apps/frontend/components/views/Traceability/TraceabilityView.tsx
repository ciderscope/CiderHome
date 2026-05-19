"use client";

import { useApp } from "../../../app/AppProviders";
import { TraceabilitySearch } from "../../features/TraceabilitySearch";
import { Card } from "../../ui/Card";
import { EntityTable } from "../../ui/EntityTable";
import { Topbar } from "../../ui/Topbar";
import { ViewHeader, ViewShell } from "../../ui/ViewPrimitives";

export const TraceabilityView = () => {
  const {
    state: { visibleAuditLogs, visibleTraceabilityEvents }
  } = useApp();

  return (
    <>
      <Topbar active="tracabilite" />
      <ViewShell>
        <ViewHeader title="Tracabilite" subtitle="Recherche ascendante ou descendante par lot, cuve, sous-lot ou echantillon." />
        <TraceabilitySearch events={visibleTraceabilityEvents} />
        <Card title="Journal d audit" eyebrow="Dernieres actions">
          <EntityTable
            rows={visibleAuditLogs}
            columns={[
              { key: "action", label: "Action" },
              { key: "entityType", label: "Entite" },
              { key: "entityId", label: "Identifiant" },
              { key: "occurredAt", label: "Date", render: (log) => new Date(log.occurredAt).toLocaleString("fr-FR") }
            ]}
          />
        </Card>
      </ViewShell>
    </>
  );
};
