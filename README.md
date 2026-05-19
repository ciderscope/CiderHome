# Gestion Cuverie Cidricole

Scaffold monorepo pour une application de gestion de cuverie cidricole multi-site, en francais, prete pour Vercel et Supabase.

La structure frontend suit au maximum `ciderscope/ciderscope` branche `codex/1305`: Next App Router, `components/ui`, `components/views`, `hooks`, `lib`, `types`, CSS Tailwind v4 a variables.

## Structure

```text
apps/
  frontend/        Next + React + Tailwind, UI et vues
  api/             API routes Vercel TypeScript
packages/
  shared/          Types, RBAC, services metier, schemas JSON
scripts/
  seed/            Fixtures JSON + seed Supabase
  sensors/         Simulateurs HTTP et MQTT
supabase/          Schema SQL, RLS, storage
docs/              Architecture et guides d'extension
```

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`

API locale:

```bash
npm run dev:api
```

## Supabase

1. Creer un projet Supabase.
2. Executer `supabase/schema.sql`, puis `supabase/storage.sql`.
3. Renseigner `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. Charger les fixtures:

```bash
npm run seed
```

Jeu de recette complet demande par le cahier des charges:

```bash
npm run fixtures:full
# PowerShell
$env:SEED_FIXTURES_DIR="scripts/seed/fixtures-full"; npm run seed
```

Ce jeu genere 40 cuves, 10 lots, 50 operations historiques, 20 analyses et 5 utilisateurs de test.

## Tests Et Qualite

```bash
npm run lint
npm run typecheck
npm run test
npm run ci
```

Les tests couvrent les services critiques: workflow de transfert, operations de chai, validation cuve, affectation reception, stock, alertes, isolation site, RBAC, tracabilite, capteurs, permissions UI et composants.

## Deploiement Vercel

Deux projets Vercel sont recommandes:

- Frontend: root directory `apps/frontend`, build `npm run build -w @cuverie/frontend`.
- API: root directory `apps/api`, build `npm run build -w @cuverie/api`.

Variables frontend:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_BASE_URL
```

Variables API:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SENSOR_INGESTION_SECRET
CSV_EXPORT_MAX_ROWS
```

## Fonctionnalites MVP Scaffold

- Auth locale + mot de passe via Supabase Auth.
- RBAC Admin, Responsable Cuverie, Operateur, Technicien Qualite.
- Dashboard capacites, alertes, transferts.
- Plan de cuverie interactif drag/drop.
- CRUD routes pour cuves, receptions vendange, lots, sous-lots/echantillons, operations, fiches de travail, stocks, analyses, documents, alertes, transferts, audit logs.
- Vues frontend reception, operations, analyses, stocks et rapports.
- Workflow operation: soumission operateur, validation responsable, execution, audit, tracabilite.
- Workflow transfert: approbation, execution, audit, tracabilite.
- Recherche tracabilite ascendante/descendante.
- Ingestion capteurs HTTP via `/api/sensors/ingest` et alias `/api/iot/events`, avec regles d'alertes parametrables.
- Export CSV a la demande.
- Schemas JSON, fixtures et OpenAPI.

## Contrats API

La specification OpenAPI est dans [docs/openapi.yaml](docs/openapi.yaml). Les nouvelles familles d'endpoints suivent les conventions REST existantes:

```text
GET/POST /api/harvest-receipts
GET/PATCH/DELETE /api/harvest-receipts/:id
POST /api/operations/:id/submit
POST /api/operations/:id/validate
POST /api/operations/:id/execute
GET/POST /api/stock-items
GET/POST /api/stock-movements
GET/POST /api/alerts
GET/POST /api/alert-rules
GET /api/reports/traceability
POST /api/iot/events
```

## Conventions De Commit

Utiliser Conventional Commits:

```text
feat(cuverie): ajouter simulation transfert
fix(api): filtrer les lots par site
test(shared): couvrir execution transfert
docs(vercel): preciser variables d'environnement
```

## Documentation

- [Architecture](docs/architecture.md)
- [OpenAPI](docs/openapi.yaml)
- [Guide d'extension](docs/extension-guide.md)
- [Adaptation CiderScope](docs/adaptation-ciderscope.md)
