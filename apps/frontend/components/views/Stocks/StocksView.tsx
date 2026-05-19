"use client";

import { FiDownload } from "react-icons/fi";
import { useApp } from "../../../app/AppProviders";
import { exportCsvUrl } from "../../../lib/api";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { EntityTable } from "../../ui/EntityTable";
import { ViewHeader, ViewShell } from "../../ui/ViewPrimitives";
import { Topbar } from "../../ui/Topbar";

export const StocksView = () => {
  const {
    state: { currentSite, visibleStockItems }
  } = useApp();

  return (
    <>
      <Topbar active="stocks" />
      <ViewShell>
        <ViewHeader
          title="Stocks oenologiques"
          subtitle="Inventaire, lots fournisseurs, dates de peremption et sorties liees aux operations."
          actions={
            <Button
              variant="secondary"
              icon={<FiDownload size={15} />}
              onClick={() => {
                window.location.href = exportCsvUrl("stock_items", currentSite.id);
              }}
            >
              CSV stocks
            </Button>
          }
        />
        <Card title="Inventaire">
          <EntityTable
            rows={visibleStockItems}
            columns={[
              { key: "name", label: "Produit" },
              { key: "category", label: "Categorie" },
              { key: "batchNumber", label: "Lot" },
              { key: "quantity", label: "Quantite", render: (item) => `${item.quantity.toLocaleString("fr-FR")} ${item.unit}` },
              {
                key: "minQuantity",
                label: "Seuil",
                render: (item) => (
                  <span className="inline-flex items-center gap-2">
                    {item.minQuantity.toLocaleString("fr-FR")} {item.unit}
                    {item.quantity <= item.minQuantity && <Badge variant="warn">bas</Badge>}
                  </span>
                )
              },
              { key: "expiryDate", label: "Peremption" }
            ]}
          />
        </Card>
      </ViewShell>
    </>
  );
};
