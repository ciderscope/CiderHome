"use client";

import { ROLE_LABELS } from "@cuverie/shared";
import { useApp } from "../../../app/AppProviders";
import { Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { Topbar } from "../../ui/Topbar";
import { ViewHeader, ViewShell } from "../../ui/ViewPrimitives";

export const AdminView = () => {
  const {
    state: { profile, sites }
  } = useApp();

  return (
    <>
      <Topbar active="admin" />
      <ViewShell>
        <ViewHeader title="Administration" subtitle="Utilisateurs, roles, sites, seuils capteurs et regles de tracabilite." />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Profil courant" eyebrow="RBAC">
            <div className="grid gap-2 text-sm">
              <p className="font-semibold text-[var(--ink)]">{profile?.fullName}</p>
              <p className="text-[var(--mid)]">{profile?.email}</p>
              {profile && <Badge>{ROLE_LABELS[profile.role]}</Badge>}
            </div>
          </Card>
          <Card title="Sites" eyebrow="Multi-site">
            <div className="grid gap-2">
              {sites.map((site) => (
                <div key={site.id} className="flex items-center justify-between rounded-[var(--radius)] border border-[var(--border)] px-3 py-2">
                  <span className="font-semibold text-[var(--ink)]">{site.name}</span>
                  <Badge variant={site.active ? "active" : "inactive"}>{site.code}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </ViewShell>
    </>
  );
};
