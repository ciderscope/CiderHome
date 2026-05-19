"use client";

import { useApp } from "../../../app/AppProviders";
import { Card } from "../../ui/Card";
import { EntityTable } from "../../ui/EntityTable";
import { Topbar } from "../../ui/Topbar";
import { ViewHeader, ViewShell } from "../../ui/ViewPrimitives";

export const LotsView = () => {
  const {
    state: { visibleLots }
  } = useApp();

  return (
    <>
      <Topbar active="lots" />
      <ViewShell>
        <ViewHeader title="Lots et echantillons" subtitle="Suivi lot, sous-lot et echantillon avec origine, statut et volume." />
        <Card title="Lots">
          <EntityTable
            rows={visibleLots}
            columns={[
              { key: "code", label: "Code" },
              { key: "productType", label: "Produit" },
              { key: "harvestYear", label: "Recolte" },
              { key: "status", label: "Statut" },
              { key: "volumeLiters", label: "Volume", render: (lot) => `${lot.volumeLiters.toLocaleString("fr-FR")} L` }
            ]}
          />
        </Card>
      </ViewShell>
    </>
  );
};

