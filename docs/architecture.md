# Architecture

```mermaid
flowchart LR
  U["Utilisateurs<br/>Admin, Responsable, Operateur, Qualite"] --> F["apps/frontend<br/>Next + React + Tailwind"]
  F --> A["apps/api<br/>Vercel Functions TS"]
  A --> S["Supabase<br/>Auth + Postgres + Storage"]
  A --> P["packages/shared<br/>Types, RBAC, workflow, schemas"]
  F --> P
  M["MQTT bridge<br/>apps/api/src/services/mqttBridge.ts"] --> A
  H["Capteurs HTTP<br/>/api/iot/events"] --> A
  Seed["scripts/seed<br/>fixtures JSON"] --> S
  R["OpenAPI<br/>docs/openapi.yaml"] --> A
```

## Decisions

- Le frontend reprend l'organisation de CiderScope: `app`, `components/ui`, `components/views`, `hooks`, `lib`, `types`.
- Les fonctions API restent separees dans `apps/api/api` pour garder un backend serverless Vercel explicite.
- Les regles critiques sont dans `packages/shared` afin d'avoir une source unique pour RBAC, transfert, operations, stocks, alertes, tracabilite, capteurs et export CSV.
- Les donnees sont isolees par `site_id`; l'API filtre les listes par sites autorises et Supabase RLS pose le filet de securite.

## Modules Fonctionnels

```mermaid
flowchart TD
  Rec["Reception vendange"] --> Lot["Lot / sous-lot"]
  Lot --> Op["Operations de chai"]
  Op --> Tank["Cuves"]
  Op --> Stock["Stocks et mouvements"]
  Tank --> Sensor["Capteurs IoT"]
  Sensor --> Alert["Alertes regles"]
  Op --> Trace["Evenements tracabilite"]
  Stock --> Trace
  Trace --> Report["Rapports / CSV"]
```
