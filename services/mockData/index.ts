import { addFoodItem } from '@/services/db/repositories/foodRepository';
import { addExerciseTemplate } from '@/services/db/repositories/workoutRepository';
import { mockExerciseTemplates } from './exerciseTemplates';
import { mockFoodItems } from './foodItems';

/**
 * Seed database with mock data for testing
 * This includes exercise templates and food items
 */
export const seedMockData = (): void => {
  console.log('🌱 Starting mock data seeding...');

  try {
    // Seed Exercise Templates
    console.log(`📝 Seeding ${mockExerciseTemplates.length} exercise templates...`);
    mockExerciseTemplates.forEach((template) => {
      try {
        addExerciseTemplate(template);
      } catch (error) {
        // Ignore duplicate errors - template might already exist
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('UNIQUE constraint failed')) {
          console.error(`Error adding exercise template ${template.name}:`, error);
        }
      }
    });
    console.log('✅ Exercise templates seeded');

    // Seed Food Items
    console.log(`🍎 Seeding ${mockFoodItems.length} food items...`);
    mockFoodItems.forEach((foodItem) => {
      try {
        addFoodItem(foodItem);
      } catch (error) {
        // Ignore duplicate errors - food item might already exist
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('UNIQUE constraint failed')) {
          console.error(`Error adding food item ${foodItem.name}:`, error);
        }
      }
    });
    console.log('✅ Food items seeded');

    console.log('🎉 Mock data seeding completed successfully!');
    console.log(`   - ${mockExerciseTemplates.length} exercise templates`);
    console.log(`   - ${mockFoodItems.length} food items`);
  } catch (error) {
    console.error('❌ Error seeding mock data:', error);
    throw error;
  }
};

/**
 * Check if mock data should be seeded based on environment
 */
export const shouldSeedMockData = (): boolean => {
  // Check if EXPO_PUBLIC_USE_MOCK_DATA is set to 'true'
  return process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';
};
