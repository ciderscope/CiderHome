import { FiAlertTriangle, FiDatabase, FiRefreshCw, FiThermometer } from "react-icons/fi";
import { Card } from "../ui/Card";

const icons = {
  capacity: FiDatabase,
  alerts: FiAlertTriangle,
  transfers: FiRefreshCw,
  sensors: FiThermometer
};

export const StatGrid = ({
  totalCapacity,
  usedVolume,
  activeTransfers,
  alertCount
}: {
  totalCapacity: number;
  usedVolume: number;
  activeTransfers: number;
  alertCount: number;
}) => {
  const utilization = totalCapacity > 0 ? Math.round((usedVolume / totalCapacity) * 100) : 0;
  const stats = [
    { id: "capacity", label: "Capacite utilisee", value: `${utilization}%`, detail: `${usedVolume.toLocaleString("fr-FR")} / ${totalCapacity.toLocaleString("fr-FR")} L` },
    { id: "alerts", label: "Alertes", value: alertCount.toString(), detail: "Qualite, capteurs, operations" },
    { id: "transfers", label: "Transferts actifs", value: activeTransfers.toString(), detail: "A approuver ou executer" },
    { id: "sensors", label: "Capteurs", value: "HTTP + MQTT", detail: "Ingestion generique active" }
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = icons[stat.id];
        return (
          <Card key={stat.id} className="animate-[slide-up_.18s_ease-out]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase text-[var(--mid)]">{stat.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-[var(--ink)]">{stat.value}</p>
                <p className="mt-1 text-xs text-[var(--mid)]">{stat.detail}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-[rgba(85,127,63,.10)] text-[var(--primary)]">
                <Icon size={18} />
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

