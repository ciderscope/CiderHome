"use client";

import { FiDownload } from "react-icons/fi";
import { useApp } from "../../../app/AppProviders";
import { exportCsvUrl } from "../../../lib/api";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Topbar } from "../../ui/Topbar";
import { ViewHeader, ViewShell } from "../../ui/ViewPrimitives";
import { StatGrid } from "../../features/StatGrid";
import { TransferWorkflow } from "../../features/TransferWorkflow";

export const DashboardView = () => {
  const {
    state: { currentSite, visibleAlerts, visibleTanks, visibleTransfers }
  } = useApp();
  const totalCapacity = visibleTanks.reduce((sum, tank) => sum + tank.capacityLiters, 0);
  const usedVolume = visibleTanks.reduce((sum, tank) => sum + tank.currentVolumeLiters, 0);

  return (
    <>
      <Topbar active="dashboard" />
      <ViewShell>
        <ViewHeader
          title="Tableau de bord"
          subtitle={`Vue operationnelle du site ${currentSite.name}: capacites, alertes, capteurs et transferts en cours.`}
          actions={
            <Button
              variant="secondary"
              icon={<FiDownload size={15} />}
              onClick={() => {
                window.location.href = exportCsvUrl("tanks", currentSite.id);
              }}
            >
              CSV cuves
            </Button>
          }
        />
        <StatGrid totalCapacity={totalCapacity} usedVolume={usedVolume} activeTransfers={visibleTransfers.length} alertCount={visibleAlerts.length} />
        <Card title="Ordres de transfert en cours" eyebrow="Workflow">
          <TransferWorkflow orders={visibleTransfers} tanks={visibleTanks} />
        </Card>
      </ViewShell>
    </>
  );
};
