"use client";

import { useApp } from "../../../app/AppProviders";
import { TransferWorkflow } from "../../features/TransferWorkflow";
import { Card } from "../../ui/Card";
import { Topbar } from "../../ui/Topbar";
import { ViewHeader, ViewShell } from "../../ui/ViewPrimitives";

export const TransfersView = () => {
  const {
    state: { visibleTransfers, visibleTanks }
  } = useApp();

  return (
    <>
      <Topbar active="transferts" />
      <ViewShell>
        <ViewHeader title="Ordres de transfert" subtitle="Creation, approbation, execution et journalisation des mouvements de cuverie." />
        <Card title="Workflow">
          <TransferWorkflow orders={visibleTransfers} tanks={visibleTanks} />
        </Card>
      </ViewShell>
    </>
  );
};

