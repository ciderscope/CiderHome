import React from "react";

interface CardProps {
  title?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ title, eyebrow, actions, children, className = "" }: CardProps) => (
  <section
    className={`min-w-0 max-w-full overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] px-6 py-5 shadow-[var(--shadow)] max-[480px]:px-3.5 max-[480px]:py-4 ${className}`}
  >
    {(title || actions) && (
      <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1 font-mono text-[11px] uppercase text-[var(--mid)]">{eyebrow}</p>}
          {title && <h2 className="text-[15px] font-bold text-[var(--ink)]">{title}</h2>}
        </div>
        {actions}
      </div>
    )}
    {children}
  </section>
);

