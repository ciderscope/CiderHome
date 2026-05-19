import React from "react";

export const ViewShell = ({ children }: { children: React.ReactNode }) => (
  <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 pb-10 pt-[78px] sm:px-6">{children}</main>
);

export const ViewHeader = ({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) => (
  <header className="flex min-w-0 flex-col gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] px-6 py-5 shadow-[var(--shadow)] md:flex-row md:items-center md:justify-between">
    <div className="min-w-0">
      <h1 className="text-2xl font-extrabold text-[var(--ink)] max-[480px]:text-xl">{title}</h1>
      {subtitle && <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-[var(--mid)]">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

export const Field = ({
  label,
  children,
  hint
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <label className="grid gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
    <span>{label}</span>
    {children}
    {hint && <span className="text-xs font-normal text-[var(--mid)]">{hint}</span>}
  </label>
);

export const inputClass =
  "min-h-[40px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(85,127,63,.16)]";

