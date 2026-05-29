# Code Structure Review

## Main Issues

- `services/database.ts` is too large and mixed in responsibility. It combines CRUD, row mapping, domain helpers, and calculations in one file, which makes it hard to change safely.
- `services/db/index.ts` still owns database open logic, migration startup, and reset logic in one place. That is workable, but it is doing too much for a single module.
- `app/_layout.tsx` is a bootstrapping hub. It handles database setup, onboarding checks, mock seeding, and notification setup in one component.

## What Feels Sloppy

- `services/database.ts` has the classic "god file" shape. It is a long list of near-duplicate map functions and query helpers, and the domain logic is spread across many unrelated entities.
- There is a lot of repetitive field copying between schema types and row shapes. That is noisy and makes schema changes expensive.
- `app/_layout.tsx` mixes app lifecycle concerns with UI rendering. The component is doing orchestration work that would be clearer in a dedicated bootstrap hook or service.

## How I Would Improve It

- Split `services/database.ts` into per-domain modules such as `services/db/food.ts`, `services/db/workouts.ts`, and `services/db/meals.ts`.
- Move row mapping helpers next to the relevant domain queries so each file owns its own conversion logic.
- Extract the app startup sequence from `app/_layout.tsx` into a `useAppBootstrap()` hook or a small bootstrap service. Additional point it would be great that the bootstrapping logic is implemented in a way that when the app is compiled the things that get setup that are only needed in dev env should not get compiled into the production build.
- Move reset and debugging helpers into a separate dev-only module so the main DB entrypoint stays focused on opening the database and running migrations.

## Suggested Order

1. Split `services/database.ts` by domain.
2. Extract startup orchestration out of `app/_layout.tsx`.
3. Separate dev/reset utilities from `services/db/index.ts`.
4. Revisit migration file generation so the Drizzle artifacts stay consistent.
