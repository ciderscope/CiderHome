"use client";

import { useMemo, useState } from "react";
import type { TraceabilityDirection, TraceabilityEvent } from "@cuverie/shared";
import { searchTraceability } from "@cuverie/shared";
import { FiSearch } from "react-icons/fi";
import { demoTraceabilityEvents } from "../../lib/demoData";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const eventLabel: Record<TraceabilityEvent["type"], string> = {
  lot_created: "Lot cree",
  sub_lot_created: "Sous-lot cree",
  operation_recorded: "Operation",
  input_applied: "Intrant",
  analysis_recorded: "Analyse",
  transfer_executed: "Transfert",
  manual_adjustment: "Ajustement"
};

export const TraceabilitySearch = ({ events = demoTraceabilityEvents }: { events?: TraceabilityEvent[] }) => {
  const [entityType, setEntityType] = useState("lot");
  const [entityId, setEntityId] = useState("LOT-2026-001");
  const [direction, setDirection] = useState<TraceabilityDirection>("downstream");
  const [submitted, setSubmitted] = useState({ entityType, entityId, direction });

  const graph = useMemo(
    () => searchTraceability(events, { entityType: submitted.entityType, entityId: submitted.entityId }, submitted.direction),
    [events, submitted]
  );
  const graphEventIds = useMemo(() => new Set(graph.edges.map((edge) => edge.eventId)), [graph.edges]);
  const visibleEvents = events.filter((event) => graphEventIds.has(event.id)).slice(0, 8);

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card title="Recherche">
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-[var(--ink)]">
            Type
            <select className="min-h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] px-3" value={entityType} onChange={(event) => setEntityType(event.target.value)}>
              <option value="lot">Lot</option>
              <option value="tank">Cuve</option>
              <option value="sample">Echantillon</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-[var(--ink)]">
            Identifiant
            <input className="min-h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] px-3" value={entityId} onChange={(event) => setEntityId(event.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["upstream", "downstream"] as const).map((value) => (
              <button
                key={value}
                className={`min-h-10 rounded-[var(--radius)] border px-3 text-sm font-semibold ${direction === value ? "border-[var(--primary)] bg-[rgba(85,127,63,.10)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--mid)]"}`}
                onClick={() => setDirection(value)}
                type="button"
              >
                {value === "upstream" ? "Ascendante" : "Descendante"}
              </button>
            ))}
          </div>
          <Button icon={<FiSearch size={15} />} onClick={() => setSubmitted({ entityType, entityId, direction })}>
            Rechercher
          </Button>
        </div>
      </Card>
      <Card title="Graphe de tracabilite">
        <div className="grid gap-3">
          {graph.nodes.map((node) => (
            <div key={`${node.entityType}:${node.entityId}`} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper2)] px-3 py-2">
              <span className="font-mono text-xs text-[var(--mid)]">{node.entityType}</span>
              <p className="font-semibold text-[var(--ink)]">{node.entityId}</p>
            </div>
          ))}
          <p className="text-xs text-[var(--mid)]">{graph.edges.length} liaison(s) retrouvee(s)</p>
          {visibleEvents.length > 0 && (
            <div className="mt-2 grid gap-2">
              {visibleEvents.map((event) => (
                <div key={event.id} className="grid gap-1 rounded-[var(--radius)] border border-[var(--border)] px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--ink)]">{eventLabel[event.type]}</span>
                    <span className="text-xs text-[var(--mid)]">{new Date(event.occurredAt).toLocaleString("fr-FR")}</span>
                  </div>
                  <p className="text-xs text-[var(--mid)]">
                    {event.sourceEntityType}:{event.sourceEntityId} {"->"} {event.targetEntityType}:{event.targetEntityId}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
