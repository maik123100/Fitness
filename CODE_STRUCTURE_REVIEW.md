# Code Structure Review

The first refactoring pass has moved database access into domain repositories and removed the old `services/database.ts` facade. Meal logging and nutrition summaries live in `services/application/mealAndNutritionService.ts` because they coordinate food, meal, and workout data. The current repository boundaries are in `services/db/repositories/`, with the food row mapper alongside them in `services/db/mappers/`.

Food search now follows a route → hook → search service → repository/provider path. The OpenFoodFacts client owns HTTP behavior, its mapper converts provider responses, and the search result card owns image presentation and fallback behavior. `FoodItem.imageUrl` is nullable; provider images remain URL metadata and do not affect identity or deduplication.

Startup responsibilities are separated into `services/bootstrap/`: database migration state, app readiness, notification setup, and development mock seeding. The root layout composes the providers and router after migrations and app bootstrap complete. Mock data is dynamically loaded only from the development bootstrap path.

Remaining improvement areas are focused repository and migration tests, stronger domain types for remaining JSON-backed workout data, and moving nutrition query calculations out of the meal application service if their ownership can be separated without duplicating cross-domain reads.
