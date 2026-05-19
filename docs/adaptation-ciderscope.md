# Adaptation Depuis CiderScope

Reference inspectee: `https://github.com/ciderscope/ciderscope`, branche `codex/1305`.

Ce scaffold reprend au maximum la structure de cette branche tout en respectant le cahier des charges monorepo:

- CiderScope racine `app/` devient `apps/frontend/app/`.
- CiderScope `components/ui` est conserve pour les primitives (`Button`, `Card`, `Badge`, `Topbar`, `ViewPrimitives`).
- CiderScope `components/views` est conserve pour les ecrans metier (`Dashboard`, `Cuverie`, `Lots`, `Transfers`, `Traceability`, `Admin`, `Auth`).
- CiderScope `hooks/useSenso.ts` inspire `hooks/useCuverie.ts`: etat central, actions memorisees, separation state/actions.
- CiderScope `lib/__tests__` inspire les tests proches des helpers frontend.
- Les helpers et regles partagees qui depassent le frontend sont deplaces vers `packages/shared`.

Les ecarts volontaires:

- L'API est separee dans `apps/api` pour des routes serverless Vercel dediees.
- Les tests frontend utilisent Jest + Testing Library comme demande, tandis que la reference utilise Vitest.
- Les tokens visuels sont documentes dans `theme.tokens.json` et exposes en CSS vars Tailwind v4.

