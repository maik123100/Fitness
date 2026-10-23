import type { FoodSearchResult } from '@/types/food';
import { useTheme } from '@/contexts/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

interface FoodSearchResultCardProps {
  result: FoodSearchResult;
  onSelect: (result: FoodSearchResult) => void;
  onDelete: (result: FoodSearchResult) => void;
}

export function FoodSearchResultCard({ result, onSelect, onDelete }: FoodSearchResultCardProps) {
  const { theme } = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const item = result.food;
  return (
    <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.sm]}>
      <Pressable style={styles.content} onPress={() => onSelect(result)} android_ripple={{ color: theme.selection }}>
        {item.imageUrl && !imageFailed ? (
          <Image source={{ uri: item.imageUrl }} style={[styles.image, { backgroundColor: theme.surface.elevated }]} onError={() => setImageFailed(true)} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.surface.elevated }]}>
            <Ionicons name="image-outline" size={24} color={theme.comment} />
          </View>
        )}
        <View style={styles.details}>
          <View style={styles.heading}>
            <Text style={[styles.name, { color: theme.foreground }]} numberOfLines={2}>{item.name}</Text>
            <View style={styles.calories}>
              <Ionicons name="flame" size={16} color={theme.orange} />
              <Text style={[styles.caloriesText, { color: theme.foreground }]}>{item.calories}</Text>
              <Text style={[styles.caloriesLabel, { color: theme.comment }]}>kcal</Text>
            </View>
          </View>
          {(item.brand || item.barcode) && (
            <Text style={[styles.context, { color: theme.comment }]} numberOfLines={1}>
              {[item.brand, item.barcode ? `Barcode ${item.barcode}` : null].filter(Boolean).join(' · ')}
            </Text>
          )}
          <View style={styles.macros}>
            <Text style={[styles.macro, { color: theme.comment }]}>Protein <Text style={{ color: theme.foreground }}>{item.protein}g</Text></Text>
            <Text style={[styles.macro, { color: theme.comment }]}>Carbs <Text style={{ color: theme.foreground }}>{item.carbs}g</Text></Text>
            <Text style={[styles.macro, { color: theme.comment }]}>Fat <Text style={{ color: theme.foreground }}>{item.fat}g</Text></Text>
          </View>
        </View>
      </Pressable>
      <Pressable style={[styles.delete, { backgroundColor: theme.surface.elevated }]} onPress={() => onDelete(result)} accessibilityLabel={`Delete ${item.name}`}>
        <Ionicons name="trash-outline" size={20} color={theme.danger} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: borderRadius.lg, marginBottom: spacing.md, overflow: 'hidden' },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  image: { width: 64, height: 64, borderRadius: borderRadius.md },
  placeholder: { width: 64, height: 64, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  details: { flex: 1 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs },
  name: { flex: 1, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, marginRight: spacing.sm },
  calories: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  caloriesText: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  caloriesLabel: { fontSize: typography.sizes.xs },
  context: { fontSize: typography.sizes.xs, marginBottom: spacing.sm },
  macros: { flexDirection: 'row', gap: spacing.md },
  macro: { fontSize: typography.sizes.xs },
  delete: { width: 52, justifyContent: 'center', alignItems: 'center' },
});
