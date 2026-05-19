"use client";

import Link from "next/link";
import {
  FiActivity,
  FiArchive,
  FiBarChart2,
  FiClipboard,
  FiDatabase,
  FiDroplet,
  FiGitBranch,
  FiHome,
  FiLogOut,
  FiMap,
  FiRefreshCw,
  FiSettings,
  FiTruck
} from "react-icons/fi";
import { useApp } from "../../app/AppProviders";
import type { AppMode } from "../../types";

const NAV = [
  { id: "dashboard" as const, label: "Tableau", href: "/dashboard", icon: FiHome },
  { id: "cuverie" as const, label: "Cuverie", href: "/cuverie", icon: FiMap },
  { id: "reception" as const, label: "Reception", href: "/reception", icon: FiTruck },
  { id: "operations" as const, label: "Operations", href: "/operations", icon: FiClipboard },
  { id: "lots" as const, label: "Lots", href: "/lots", icon: FiDatabase },
  { id: "analyses" as const, label: "Analyses", href: "/analyses", icon: FiDroplet },
  { id: "stocks" as const, label: "Stocks", href: "/stocks", icon: FiArchive },
  { id: "transferts" as const, label: "Transferts", href: "/transferts", icon: FiRefreshCw },
  { id: "tracabilite" as const, label: "Tracabilite", href: "/tracabilite", icon: FiGitBranch },
  { id: "rapports" as const, label: "Rapports", href: "/rapports", icon: FiBarChart2 },
  { id: "admin" as const, label: "Admin", href: "/admin", icon: FiSettings }
];

const navButtonClass = (active = false) =>
  [
    "inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-[var(--radius)] border border-transparent px-2 py-[7px] text-xs font-medium whitespace-nowrap transition-[background,border-color,color] sm:min-h-[38px] sm:gap-[7px] sm:px-3.5 sm:py-2 sm:text-[13px]",
    active
      ? "bg-[rgba(85,127,63,.10)] font-semibold text-[var(--primary)]"
      : "text-[var(--mid)] hover:bg-[var(--paper3)] hover:text-[var(--ink)]"
  ]
    .filter(Boolean)
    .join(" ");

export const Topbar = ({ active }: { active: AppMode }) => {
  const {
    state: { sites, currentSiteId, online },
    actions: { setMode, setCurrentSiteId, signOut }
  } = useApp();

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex h-15 max-w-[100vw] flex-nowrap items-center gap-2 overflow-x-auto border-b border-[var(--border)] bg-[var(--topbar-bg)] px-3 backdrop-blur-md [backdrop-filter:saturate(180%)_blur(8px)] [scrollbar-width:none] sm:gap-3 sm:px-6 [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-2 whitespace-nowrap text-sm font-bold text-[var(--ink)]">
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] text-white">
          <FiActivity size={16} />
        </span>
        <span className="hidden text-[13px] font-bold text-[var(--primary)] sm:inline">IFPC</span>
        <span className="text-[13px] font-bold text-[var(--ink)]">Gestion Cuverie</span>
      </div>
      <select
        className="min-h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] px-2 text-xs font-semibold text-[var(--ink)] outline-none"
        value={currentSiteId}
        onChange={(event) => setCurrentSiteId(event.target.value)}
        aria-label="Site courant"
      >
        {sites.map((site) => (
          <option key={site.id} value={site.id}>
            {site.code}
          </option>
        ))}
      </select>
      <div className="flex-1" />
      <span
        className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium md:inline-flex ${
          online
            ? "border-[rgba(85,127,63,.18)] bg-[rgba(85,127,63,.08)] text-[var(--primary)]"
            : "border-[rgba(179,38,30,.18)] bg-[rgba(179,38,30,.07)] text-[var(--danger)]"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${online ? "animate-pulse bg-[var(--primary)]" : "bg-[var(--danger)]"}`} />
        {online ? "Connecte" : "Local"}
      </span>
      <nav className="flex gap-px sm:gap-1" aria-label="Navigation principale">
        {NAV.map(({ id, label, href, icon: Icon }) => (
          <Link key={id} href={href} className={navButtonClass(active === id)} onClick={() => setMode(id)}>
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
        <button className={`${navButtonClass(false)} hover:text-[var(--danger)]`} onClick={signOut} title="Se deconnecter">
          <FiLogOut size={14} />
          <span className="hidden sm:inline">Sortie</span>
        </button>
      </nav>
    </div>
  );
};
