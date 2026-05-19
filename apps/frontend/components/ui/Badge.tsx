import React from "react";

interface BadgeProps {
  variant?: "active" | "inactive" | "sig" | "ns" | "ok" | "warn";
  children: React.ReactNode;
  className?: string;
}

export const Badge = ({ variant = "ok", children, className = "" }: BadgeProps) => {
  const badgeClass =
    variant === "active"
      ? "inline-block rounded-full bg-[rgba(85,127,63,.10)] px-2.5 py-[3px] text-[10px] font-semibold uppercase text-[var(--primary)]"
      : variant === "inactive"
        ? "inline-block rounded-full bg-[var(--paper3)] px-2.5 py-[3px] text-[10px] font-semibold uppercase text-[var(--mid)]"
        : {
            sig: "inline-block rounded-full bg-[rgba(179,38,30,.10)] px-[9px] py-[3px] text-[10.5px] font-semibold uppercase text-[var(--danger)]",
            ns: "inline-block rounded-full bg-[var(--paper3)] px-[9px] py-[3px] text-[10.5px] font-semibold uppercase text-[var(--mid)]",
            ok: "inline-block rounded-full bg-[rgba(85,127,63,.10)] px-[9px] py-[3px] text-[10.5px] font-semibold uppercase text-[var(--primary)]",
            warn: "inline-block rounded-full bg-[rgba(189,114,22,.12)] px-[9px] py-[3px] text-[10.5px] font-semibold uppercase text-[var(--warn)]"
          }[variant];

  return <span className={`${badgeClass} ${className}`}>{children}</span>;
};

