import type { FoodSearchResult } from '@/types/food';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { FoodSearchResultCard } from './FoodSearchResultCard';

interface FoodSearchResultsProps {
  results: FoodSearchResult[];
  query: string;
  loading: boolean;
  onSelect: (result: FoodSearchResult) => void;
  onDelete: (result: FoodSearchResult) => void;
}

export function FoodSearchResults({ results, query, loading, onSelect, onDelete }: FoodSearchResultsProps) {
  const { theme } = useTheme();
  return (
    <>
      {query.length > 0 && (
        <View style={styles.header}>
          <Text style={[styles.count, { color: theme.comment }]}>
            {loading ? 'Searching local foods and OpenFoodFacts...' : `${results.length} ${results.length === 1 ? 'result' : 'results'} found`}
          </Text>
        </View>
      )}
      <FlatList
        data={results}
        keyExtractor={(result) => result.food.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <FoodSearchResultCard result={item} onSelect={onSelect} onDelete={onDelete} />}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={64} color={theme.comment} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.foreground }]}>
              {query.length > 0 ? 'No food items found' : 'Start searching for food'}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.comment }]}>
              {query.length > 0
                ? 'Try a different search term or add a new food item'
                : 'Type in the search box above to find food items'}
            </Text>
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  count: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl * 2, paddingHorizontal: spacing.xl },
  emptyIcon: { marginBottom: spacing.lg, opacity: 0.5 },
  emptyText: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, marginBottom: spacing.sm, textAlign: 'center' },
  emptySubtext: { fontSize: typography.sizes.md, fontWeight: typography.weights.regular, textAlign: 'center', lineHeight: 24 },
});
