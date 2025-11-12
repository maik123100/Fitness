# Mock Data System

This directory contains mock data for testing and development purposes.

## Overview

The mock data system provides pre-populated exercise templates and food items that can be automatically seeded into the database when running the app in development/testing mode.

## Contents

### Exercise Templates (`exerciseTemplates.ts`)

Contains **22 exercise templates** covering various muscle groups:

- **Chest**: Bench Press, Incline Bench Press, Dumbbell Flyes, Push-ups
- **Back**: Deadlift, Pull-ups, Barbell Row, Lat Pulldown
- **Legs**: Squat, Leg Press, Lunges, Leg Curl
- **Shoulders**: Overhead Press, Lateral Raises, Front Raises
- **Arms**: Bicep Curl, Hammer Curl, Tricep Dips, Tricep Extension
- **Core**: Plank, Crunches, Russian Twists

Each exercise includes realistic default set targets (reps and weight).

### Food Items (`foodItems.ts`)

Contains **35+ food items** across multiple categories:

- **Proteins**: Chicken Breast, Salmon, Eggs, Ground Beef
- **Dairy**: Greek Yogurt, Milk, Cheddar Cheese
- **Grains**: Brown Rice, Oatmeal, Whole Wheat Bread, Pasta
- **Vegetables**: Broccoli, Spinach, Carrots, Sweet Potato
- **Fruits**: Banana, Apple, Blueberries, Strawberries
- **Fats & Oils**: Olive Oil, Avocado, Almonds, Peanut Butter
- **Beverages**: Water, Coffee, Green Tea, Orange Juice
- **Snacks**: Protein Bar, Dark Chocolate

Each food item includes:
- Complete macronutrients (calories, protein, carbs, fat, fiber)
- Vitamins and minerals where applicable
- Serving size and unit
- Verified status for easy testing

## Usage

### Enable Mock Data

To run the app with mock data, use the provided npm script:

```bash
npm run start:mock
```

This automatically sets the `EXPO_PUBLIC_USE_MOCK_DATA=true` environment variable.

### Manual Environment Variable

Alternatively, you can manually set the environment variable:

```bash
EXPO_PUBLIC_USE_MOCK_DATA=true npm start
```

Or create a `.env` file:

```env
EXPO_PUBLIC_USE_MOCK_DATA=true
```

### Disable Mock Data

Simply run the app normally without the environment variable:

```bash
npm start
```

## How It Works

1. The `seedMockData()` function is called during app initialization (in `app/_layout.tsx`)
2. It checks if `EXPO_PUBLIC_USE_MOCK_DATA` is set to `'true'`
3. If enabled, it populates the database with:
   - All exercise templates from `exerciseTemplates.ts`
   - All food items from `foodItems.ts`
4. Duplicate entries are gracefully handled (safe to run multiple times)
5. Progress is logged to the console for debugging

## Benefits

- **Instant Testing**: No need to manually add exercises or food items
- **Realistic Data**: All mock data uses real-world values
- **Comprehensive Coverage**: Wide variety of exercises and foods
- **Safe**: Won't overwrite existing data (only adds if not present)
- **Easy to Use**: Single command to enable/disable

## Customization

To add your own mock data:

1. Add items to `exerciseTemplates.ts` or `foodItems.ts`
2. Follow the existing format and TypeScript types
3. The seeder will automatically pick up new items

## Notes

- Mock data is only seeded on app initialization
- All food items are marked as `isVerified: true`
- Exercise templates use sensible default weights (adjustable in-app)
- Seeding is idempotent (safe to run multiple times)
