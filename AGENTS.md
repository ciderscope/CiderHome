# Conventions Agents

Ce scaffold suit la branche de reference `ciderscope/ciderscope@codex/1305` pour l'organisation applicative:

- `app/` pour le shell Next App Router et les providers.
- `components/ui/` pour les primitives visuelles reutilisables.
- `components/features/` pour les modules metier composes.
- `components/views/` pour les ecrans.
- `hooks/` pour l'etat applicatif client.
- `lib/` pour les clients, helpers et tests proches du domaine.
- `types/` pour les types publics cote frontend.

Les regles metier partagees restent dans `packages/shared` pour etre consommees par le frontend, l'API et les tests.

