"use client";

import { FiDownload } from "react-icons/fi";
import { useApp } from "../../../app/AppProviders";
import { exportCsvUrl } from "../../../lib/api";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { EntityTable } from "../../ui/EntityTable";
import { ViewHeader, ViewShell } from "../../ui/ViewPrimitives";
import { Topbar } from "../../ui/Topbar";

export const ReportsView = () => {
  const {
    state: { currentSite, visibleAlerts, visibleLots, visibleTransfers }
  } = useApp();

  return (
    <>
      <Topbar active="rapports" />
      <ViewShell>
        <ViewHeader
          title="Rapports et conformite"
          subtitle="Registre de chai, audit, indicateurs et exports CSV ad hoc pour les controles."
          actions={
            <Button
              variant="secondary"
              icon={<FiDownload size={15} />}
              onClick={() => {
                window.location.href = exportCsvUrl("traceability_events", currentSite.id);
              }}
            >
              CSV tracabilite
            </Button>
          }
        />
        <div className="grid gap-5 lg:grid-cols-3">
          <Card title="Lots suivis" eyebrow="KPI">
            <p className="text-4xl font-extrabold text-[var(--primary)]">{visibleLots.length}</p>
            <p className="mt-2 text-sm text-[var(--mid)]">Lots actifs avec tracabilite disponible.</p>
          </Card>
          <Card title="Transferts" eyebrow="KPI">
            <p className="text-4xl font-extrabold text-[var(--primary)]">{visibleTransfers.length}</p>
            <p className="mt-2 text-sm text-[var(--mid)]">Ordres ouverts ou en attente.</p>
          </Card>
          <Card title="Alertes ouvertes" eyebrow="KPI">
            <p className="text-4xl font-extrabold text-[var(--danger)]">{visibleAlerts.length}</p>
            <p className="mt-2 text-sm text-[var(--mid)]">Seuils qualite, capteurs et stocks.</p>
          </Card>
        </div>
        <Card title="Alertes">
          <EntityTable
            rows={visibleAlerts}
            columns={[
              { key: "severity", label: "Niveau" },
              { key: "message", label: "Message" },
              { key: "entityType", label: "Entite" },
              { key: "triggeredAt", label: "Declenchee", render: (alert) => new Date(alert.triggeredAt).toLocaleString("fr-FR") }
            ]}
          />
        </Card>
      </ViewShell>
    </>
  );
};
