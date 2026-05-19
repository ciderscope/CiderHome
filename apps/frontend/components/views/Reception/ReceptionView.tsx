"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { FiDownload, FiTruck } from "react-icons/fi";
import { useApp } from "../../../app/AppProviders";
import { exportCsvUrl } from "../../../lib/api";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { EntityTable } from "../../ui/EntityTable";
import { Field, inputClass, ViewHeader, ViewShell } from "../../ui/ViewPrimitives";
import { Topbar } from "../../ui/Topbar";

export const ReceptionView = () => {
  const {
    state: { currentSite, visibleHarvestReceipts, visibleTanks },
    actions: { createHarvestReceipt, markSaving }
  } = useApp();
  const [draft, setDraft] = useState({
    parcel: "Parcelle des Hauts Vergers",
    grapeVariety: "Douce Moen",
    supplier: "Domaine Keravel",
    weightKg: "12800",
    assignedTankId: ""
  });

  const availableTanks = visibleTanks.filter((tank) => tank.status === "available" || tank.currentVolumeLiters === 0);
  const selectedTankId = draft.assignedTankId || availableTanks[0]?.id || "";
  const updateDraft = (key: keyof typeof draft, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleCreateReceipt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const weightKg = Number(draft.weightKg);
    if (!draft.parcel.trim() || !draft.grapeVariety.trim() || !Number.isFinite(weightKg) || weightKg <= 0) {
      return;
    }

    createHarvestReceipt({
      parcel: draft.parcel,
      grapeVariety: draft.grapeVariety,
      supplier: draft.supplier,
      weightKg,
      assignedTankId: selectedTankId || undefined
    });
    markSaving();
    setDraft((prev) => ({ ...prev, parcel: "", weightKg: "", assignedTankId: "" }));
  };

  return (
    <>
      <Topbar active="reception" />
      <ViewShell>
        <ViewHeader
          title="Reception vendange"
          subtitle={`Enregistrement des apports, maturite, documents et affectation cuve pour ${currentSite.name}.`}
          actions={
            <Button
              variant="secondary"
              icon={<FiDownload size={15} />}
              onClick={() => {
                window.location.href = exportCsvUrl("harvest_receipts", currentSite.id);
              }}
            >
              CSV receptions
            </Button>
          }
        />
        <Card title="Nouvel apport" eyebrow="Saisie guidee">
          <form onSubmit={handleCreateReceipt}>
            <div className="grid gap-4 md:grid-cols-5">
              <Field label="Parcelle">
                <input className={inputClass} value={draft.parcel} onChange={(event) => updateDraft("parcel", event.target.value)} />
              </Field>
              <Field label="Cepage">
                <input className={inputClass} value={draft.grapeVariety} onChange={(event) => updateDraft("grapeVariety", event.target.value)} />
              </Field>
              <Field label="Fournisseur">
                <input className={inputClass} value={draft.supplier} onChange={(event) => updateDraft("supplier", event.target.value)} />
              </Field>
              <Field label="Poids kg">
                <input className={inputClass} type="number" min={1} value={draft.weightKg} onChange={(event) => updateDraft("weightKg", event.target.value)} />
              </Field>
              <Field label="Cuve proposee">
                <select className={inputClass} value={selectedTankId} onChange={(event) => updateDraft("assignedTankId", event.target.value)}>
                  {availableTanks.map((tank) => (
                    <option key={tank.id} value={tank.id}>
                      {tank.code} - {(tank.usefulCapacityLiters ?? tank.capacityLiters).toLocaleString("fr-FR")} L utiles
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button icon={<FiTruck size={15} />} type="submit">
                Enregistrer en brouillon
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Apports recents">
          <EntityTable
            rows={visibleHarvestReceipts}
            columns={[
              { key: "receiptNumber", label: "Bon" },
              { key: "parcel", label: "Parcelle" },
              { key: "grapeVariety", label: "Cepage" },
              { key: "weightKg", label: "Poids", render: (receipt) => `${receipt.weightKg.toLocaleString("fr-FR")} kg` },
              { key: "receivedAt", label: "Reception", render: (receipt) => new Date(receipt.receivedAt).toLocaleString("fr-FR") }
            ]}
          />
        </Card>
      </ViewShell>
    </>
  );
};
