"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { Tank } from "@cuverie/shared";
import { FiPlus } from "react-icons/fi";
import { useApp } from "../../../app/AppProviders";
import { TankYardMap } from "../../features/TankYardMap";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { EntityTable } from "../../ui/EntityTable";
import { Topbar } from "../../ui/Topbar";
import { Field, inputClass, ViewHeader, ViewShell } from "../../ui/ViewPrimitives";

export const CuverieView = () => {
  const {
    state: { visibleLots, visibleTanks },
    actions: { createTank, createTransferOrder, moveTank, markSaving }
  } = useApp();
  const [draft, setDraft] = useState({
    code: "",
    name: "",
    capacityLiters: "5000",
    usefulCapacityLiters: "4800",
    currentVolumeLiters: "0",
    material: "inox" as Tank["material"],
    zone: "Nord",
    state: "vide" as NonNullable<Tank["state"]>,
    contentLotId: ""
  });

  const updateDraft = (key: keyof typeof draft, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleCreateTank = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const capacityLiters = Number(draft.capacityLiters);
    const usefulCapacityLiters = Number(draft.usefulCapacityLiters);
    const currentVolumeLiters = Number(draft.currentVolumeLiters);
    if (!draft.code.trim() || !draft.name.trim() || !Number.isFinite(capacityLiters) || capacityLiters <= 0) {
      return;
    }

    createTank({
      code: draft.code,
      name: draft.name,
      capacityLiters,
      usefulCapacityLiters: Number.isFinite(usefulCapacityLiters) && usefulCapacityLiters > 0 ? usefulCapacityLiters : capacityLiters,
      currentVolumeLiters: Number.isFinite(currentVolumeLiters) ? Math.max(0, Math.min(currentVolumeLiters, capacityLiters)) : 0,
      material: draft.material,
      zone: draft.zone,
      state: draft.state,
      contentLotId: draft.contentLotId || undefined
    });
    markSaving();
    setDraft((prev) => ({
      ...prev,
      code: "",
      name: "",
      currentVolumeLiters: "0",
      contentLotId: ""
    }));
  };

  return (
    <>
      <Topbar active="cuverie" />
      <ViewShell>
        <ViewHeader title="Plan de cuverie" subtitle="Deplacez les cuves par glisser-deposer et testez un scenario de transfert avant creation d ordre." />
        <Card title="Nouvelle cuve" eyebrow="Creation rapide">
          <form className="grid gap-4" onSubmit={handleCreateTank}>
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Code">
                <input className={inputClass} value={draft.code} onChange={(event) => updateDraft("code", event.target.value)} placeholder="C-03" />
              </Field>
              <Field label="Nom">
                <input className={inputClass} value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} placeholder="Cuve C-03" />
              </Field>
              <Field label="Capacite">
                <input className={inputClass} type="number" min={1} value={draft.capacityLiters} onChange={(event) => updateDraft("capacityLiters", event.target.value)} />
              </Field>
              <Field label="Capacite utile">
                <input className={inputClass} type="number" min={1} value={draft.usefulCapacityLiters} onChange={(event) => updateDraft("usefulCapacityLiters", event.target.value)} />
              </Field>
              <Field label="Volume initial">
                <input className={inputClass} type="number" min={0} value={draft.currentVolumeLiters} onChange={(event) => updateDraft("currentVolumeLiters", event.target.value)} />
              </Field>
              <Field label="Lot contenu">
                <select className={inputClass} value={draft.contentLotId} onChange={(event) => updateDraft("contentLotId", event.target.value)}>
                  <option value="">Aucun lot</option>
                  {visibleLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.code}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Matiere">
                <select className={inputClass} value={draft.material} onChange={(event) => updateDraft("material", event.target.value)}>
                  <option value="inox">Inox</option>
                  <option value="beton">Beton</option>
                  <option value="bois">Bois</option>
                  <option value="fibre">Fibre</option>
                  <option value="amphore">Amphore</option>
                  <option value="autre">Autre</option>
                </select>
              </Field>
              <Field label="Zone">
                <input className={inputClass} value={draft.zone} onChange={(event) => updateDraft("zone", event.target.value)} />
              </Field>
              <Field label="Etat">
                <select className={inputClass} value={draft.state} onChange={(event) => updateDraft("state", event.target.value)}>
                  <option value="vide">Vide</option>
                  <option value="fermentation">Fermentation</option>
                  <option value="elevage">Elevage</option>
                  <option value="nettoyage">Nettoyage</option>
                  <option value="attente">Attente</option>
                </select>
              </Field>
            </div>
            <div className="flex justify-end">
              <Button icon={<FiPlus size={15} />} type="submit">
                Creer la cuve
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Plan interactif">
          <TankYardMap
            tanks={visibleTanks}
            onMoveTank={(tankId, position) => {
              moveTank(tankId, position);
              markSaving();
            }}
            onSimulateTransfer={(sourceTankId, targetTankId, requestedVolumeLiters) => {
              createTransferOrder({ sourceTankId, targetTankId, requestedVolumeLiters });
              markSaving();
            }}
          />
        </Card>
        <Card title="Cuves">
          <EntityTable
            rows={visibleTanks}
            columns={[
              { key: "code", label: "Code" },
              { key: "name", label: "Nom" },
              { key: "capacityLiters", label: "Capacite", render: (tank) => `${tank.capacityLiters.toLocaleString("fr-FR")} L` },
              { key: "currentVolumeLiters", label: "Volume", render: (tank) => `${tank.currentVolumeLiters.toLocaleString("fr-FR")} L` },
              { key: "temperatureC", label: "Temp.", render: (tank) => (tank.temperatureC === undefined ? "-" : `${tank.temperatureC} C`) },
              { key: "state", label: "Etat chai", render: (tank) => tank.state ?? tank.status },
              { key: "zone", label: "Zone" }
            ]}
          />
        </Card>
      </ViewShell>
    </>
  );
};
