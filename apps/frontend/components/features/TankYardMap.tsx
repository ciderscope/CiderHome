"use client";

import { useMemo, useState } from "react";
import type { Tank } from "@cuverie/shared";
import { FiMove, FiRefreshCw } from "react-icons/fi";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const statusLabel: Record<Tank["status"], string> = {
  available: "disponible",
  occupied: "occupee",
  cleaning: "nettoyage",
  maintenance: "maintenance",
  blocked: "bloquee"
};

export const TankYardMap = ({
  tanks,
  onMoveTank,
  onSimulateTransfer
}: {
  tanks: Tank[];
  onMoveTank: (tankId: string, position: { x: number; y: number }) => void;
  onSimulateTransfer: (sourceId: string, targetId: string, liters: number) => void;
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [liters, setLiters] = useState(500);

  const sourceTank = useMemo(() => tanks.find((tank) => tank.id === sourceId), [sourceId, tanks]);
  const targetTank = useMemo(() => tanks.find((tank) => tank.id === targetId), [targetId, tanks]);
  const selectedPairValid = Boolean(sourceTank && targetTank && sourceTank.id !== targetTank.id);
  const sourceHasVolume = Boolean(sourceTank && liters > 0 && sourceTank.currentVolumeLiters >= liters);
  const targetHasCapacity = Boolean(targetTank && targetTank.capacityLiters - targetTank.currentVolumeLiters >= liters);
  const canCreateOrder = selectedPairValid && sourceHasVolume && targetHasCapacity;
  const transferMessage = !selectedPairValid
    ? "Choisir deux cuves distinctes."
    : !sourceHasVolume
      ? "Volume source insuffisant."
      : !targetHasCapacity
        ? "Capacite cible insuffisante."
        : "Ordre pret a creer.";

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div
        className="relative min-h-[460px] overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[linear-gradient(90deg,var(--yard-grid)_1px,transparent_1px),linear-gradient(0deg,var(--yard-grid)_1px,transparent_1px)] bg-[length:42px_42px]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!draggedId) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = Math.max(2, Math.min(86, ((event.clientX - rect.left) / rect.width) * 100));
          const y = Math.max(2, Math.min(82, ((event.clientY - rect.top) / rect.height) * 100));
          onMoveTank(draggedId, { x, y });
          setDraggedId(null);
        }}
        aria-label="Plan de cuverie interactif"
      >
        {tanks.map((tank) => {
          const fillRate = Math.round((tank.currentVolumeLiters / tank.capacityLiters) * 100);
          return (
            <button
              key={tank.id}
              type="button"
              draggable
              onDragStart={() => setDraggedId(tank.id)}
              onClick={() => (sourceId ? setTargetId(tank.id) : setSourceId(tank.id))}
              className="absolute w-[168px] cursor-move rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--paper)] p-3 text-left shadow-[var(--shadow-md)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
              style={{ left: `${tank.position.x}%`, top: `${tank.position.y}%` }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[13px] font-bold text-[var(--ink)]">{tank.code}</span>
                <FiMove className="text-[var(--mid)]" size={14} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--paper3)]">
                <span className="block h-full rounded-full bg-[var(--primary)]" style={{ width: `${fillRate}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--mid)]">{fillRate}%</span>
                <Badge variant={tank.status === "blocked" ? "sig" : tank.status === "available" ? "inactive" : "ok"}>
                  {statusLabel[tank.status]}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      <aside className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] p-4 shadow-[var(--shadow)]">
        <h3 className="text-[15px] font-bold text-[var(--ink)]">Simulation transfert</h3>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-[var(--ink)]">
            Source
            <select className="min-h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] px-3" value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
              <option value="">Choisir</option>
              {tanks.map((tank) => (
                <option key={tank.id} value={tank.id}>
                  {tank.code} - {tank.currentVolumeLiters} L
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-[var(--ink)]">
            Cible
            <select className="min-h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] px-3" value={targetId} onChange={(event) => setTargetId(event.target.value)}>
              <option value="">Choisir</option>
              {tanks.map((tank) => (
                <option key={tank.id} value={tank.id}>
                  {tank.code} - libre {tank.capacityLiters - tank.currentVolumeLiters} L
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-[var(--ink)]">
            Volume
            <input className="min-h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] px-3" type="number" min={1} value={liters} onChange={(event) => setLiters(Number(event.target.value))} />
          </label>
          <Button
            icon={<FiRefreshCw size={15} />}
            disabled={!canCreateOrder}
            onClick={() => canCreateOrder && onSimulateTransfer(sourceId, targetId, liters)}
          >
            Creer l ordre
          </Button>
          <p className="text-xs text-[var(--mid)]">{transferMessage}</p>
        </div>
      </aside>
    </div>
  );
};
