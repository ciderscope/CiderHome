import React from "react";

export const AuthShell = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <main className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col justify-center px-4 py-10">
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] text-lg font-extrabold text-white">
        GC
      </div>
      <h1 className="text-2xl font-extrabold text-[var(--ink)]">{title}</h1>
      <p className="mt-2 text-sm text-[var(--mid)]">{subtitle}</p>
    </div>
    <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--paper)] p-6 shadow-[var(--shadow-md)]">
      {children}
    </section>
  </main>
);

