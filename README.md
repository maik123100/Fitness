# Fitness App

A mobile application to track your fitness journey, including workouts, nutrition, and progress.

## Features

-   **Workout Tracking:** Create and manage workout templates, track your sets, reps, and weights during a workout session.
-   **Workout Progression:** Visualize your workout progression with interactive charts.
    -   Select different exercises to see your progress over time.
    -   Switch between different data views, such as repetitions, weight, and intensity.
-   **Nutrition Tracking:** Log your meals and track your calorie and macro-nutrient intake.
-   **Food Search:** Search the local food library and optionally include OpenFoodFacts products. Imported product images are optional metadata; foods without a valid image continue to work normally.
-   **Calorie Analysis:** Analyze your calorie intake over a 7-day period with a clear and easy-to-understand graph.

## Getting Started

1.  **Install dependencies**

    ```bash
    npm install
    ```

2.  **Start the app**

    ```bash
    npm run start
    ```

3.  **Start with development sample data**

    ```bash
    npm run start:mock
    ```

   Mock data is seeded only when running a development build with this command. Product images are stored as nullable remote URLs; no image files are downloaded or cached. Confirm OpenFoodFacts attribution and image usage terms before release.

## Architecture

- Domain persistence lives in `services/db/repositories/`.
- Meal logging and nutrition workflows that coordinate domains live in `services/application/mealAndNutritionService.ts`.
- Food search orchestration lives in `services/food/` and `hooks/food/`; OpenFoodFacts transport and mapping live in `services/providers/`.
- Startup services live in `services/bootstrap/`.

New code should import directly from its domain repository or application service.
## Realeses
I use expo to build the apk of the App. These will be under the Realeses section and the commits which match the version of an apk will be marked with a tag. Feel free to build a apk yourself since Realeses will happen at mostly random times.
## Technologies Used

-   [Expo](https://expo.dev/)
-   [React Native](https://reactnative.dev/)
-   [React Native Chart Kit](https://github.com/indiesp/react-native-chart-kit)
-   [TypeScript](https://www.typescriptlang.org/)

(This README.md was LLM generated)
