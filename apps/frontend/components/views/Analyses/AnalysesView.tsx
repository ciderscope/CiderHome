"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useApp } from "../../../app/AppProviders";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { EntityTable } from "../../ui/EntityTable";
import { Field, inputClass, ViewHeader, ViewShell } from "../../ui/ViewPrimitives";
import { Topbar } from "../../ui/Topbar";

export const AnalysesView = () => {
  const {
    state: { visibleAnalyses, visibleLots, visibleTanks },
    actions: { createAnalysis, markSaving }
  } = useApp();
  const [draft, setDraft] = useState({
    sampleCode: "ECH-C01-0518",
    lotId: visibleLots[0]?.id ?? "",
    tankId: visibleTanks[0]?.id ?? "",
    ph: "3.55",
    densite: "1.018",
    temperatureC: "13.4",
    so2LibreMgL: "22",
    alcoolPct: "4.8",
    compliant: "true",
    comments: ""
  });

  const updateDraft = (key: keyof typeof draft, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));
  const lotLabel = (lotId?: string) => visibleLots.find((lot) => lot.id === lotId)?.code ?? "-";
  const tankLabel = (tankId?: string) => visibleTanks.find((tank) => tank.id === tankId)?.code ?? "-";

  const numberResult = (value: string) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : value;
  };

  const handleCreateAnalysis = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.sampleCode.trim() || (!draft.lotId && !draft.tankId)) {
      return;
    }

    createAnalysis({
      sampleCode: draft.sampleCode,
      lotId: draft.lotId || undefined,
      tankId: draft.tankId || undefined,
      results: {
        ph: numberResult(draft.ph),
        densite: numberResult(draft.densite),
        temperatureC: numberResult(draft.temperatureC),
        so2LibreMgL: numberResult(draft.so2LibreMgL),
        alcoolPct: numberResult(draft.alcoolPct)
      },
      compliant: draft.compliant === "true",
      comments: draft.comments
    });
    markSaving();
    setDraft((prev) => ({
      ...prev,
      sampleCode: `ECH-${new Date().getHours()}${new Date().getMinutes()}`,
      comments: ""
    }));
  };

  return (
    <>
      <Topbar active="analyses" />
      <ViewShell>
        <ViewHeader title="Analyses qualite" subtitle="Saisie laboratoire, historique par lot/cuve et controle des seuils parametrables." />
        <Card title="Saisie labo externe" eyebrow="Controle qualite">
          <form className="grid gap-4" onSubmit={handleCreateAnalysis}>
            <div className="grid gap-4 md:grid-cols-5">
              <Field label="Code echantillon">
                <input className={inputClass} value={draft.sampleCode} onChange={(event) => updateDraft("sampleCode", event.target.value)} />
              </Field>
              <Field label="Lot">
                <select className={inputClass} value={draft.lotId} onChange={(event) => updateDraft("lotId", event.target.value)}>
                  <option value="">Sans lot</option>
                  {visibleLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.code}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Cuve">
                <select className={inputClass} value={draft.tankId} onChange={(event) => updateDraft("tankId", event.target.value)}>
                  <option value="">Sans cuve</option>
                  {visibleTanks.map((tank) => (
                    <option key={tank.id} value={tank.id}>
                      {tank.code}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="pH">
                <input className={inputClass} value={draft.ph} onChange={(event) => updateDraft("ph", event.target.value)} />
              </Field>
              <Field label="Densite">
                <input className={inputClass} value={draft.densite} onChange={(event) => updateDraft("densite", event.target.value)} />
              </Field>
              <Field label="Temperature">
                <input className={inputClass} value={draft.temperatureC} onChange={(event) => updateDraft("temperatureC", event.target.value)} />
              </Field>
              <Field label="SO2 libre">
                <input className={inputClass} value={draft.so2LibreMgL} onChange={(event) => updateDraft("so2LibreMgL", event.target.value)} />
              </Field>
              <Field label="Alcool">
                <input className={inputClass} value={draft.alcoolPct} onChange={(event) => updateDraft("alcoolPct", event.target.value)} />
              </Field>
              <Field label="Conformite">
                <select className={inputClass} value={draft.compliant} onChange={(event) => updateDraft("compliant", event.target.value)}>
                  <option value="true">Conforme</option>
                  <option value="false">A surveiller</option>
                </select>
              </Field>
              <Field label="Commentaire">
                <input className={inputClass} value={draft.comments} onChange={(event) => updateDraft("comments", event.target.value)} placeholder="Observation labo" />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button icon={<FiPlus size={15} />} type="submit">
                Enregistrer l analyse
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Historique analyses">
          <EntityTable
            rows={visibleAnalyses}
            columns={[
              { key: "sampleCode", label: "Echantillon" },
              { key: "lotId", label: "Lot", render: (analysis) => lotLabel(analysis.lotId) },
              { key: "tankId", label: "Cuve", render: (analysis) => tankLabel(analysis.tankId) },
              { key: "measuredAt", label: "Mesure", render: (analysis) => new Date(analysis.measuredAt).toLocaleString("fr-FR") },
              { key: "results", label: "Resultats", render: (analysis) => Object.entries(analysis.results).map(([key, value]) => `${key}: ${value}`).join(" / ") },
              { key: "compliant", label: "Conforme", render: (analysis) => (analysis.compliant ? "Oui" : "Non") }
            ]}
          />
        </Card>
      </ViewShell>
    </>
  );
};
