import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function CollapsibleSection({ 
  title, 
  isExpanded, 
  onToggle, 
  children,
  icon 
}: CollapsibleSectionProps) {
  const { theme } = useTheme();
  const rotation = useSharedValue(isExpanded ? 180 : 0);

  useEffect(() => {
    rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 300 });
  }, [isExpanded, rotation]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.header, { backgroundColor: theme.surface.card }, shadows.sm]} 
        onPress={onToggle}
        android_ripple={{ color: theme.selection }}
      >
        <View style={styles.headerContent}>
          {icon && <Ionicons name={icon} size={24} color={theme.primary} style={styles.icon} />}
          <Text style={[styles.title, { color: theme.foreground }]}>{title}</Text>
        </View>
        <Animated.View style={animatedIconStyle}>
          <Ionicons name="chevron-down" size={24} color={theme.comment} />
        </Animated.View>
      </Pressable>

      {isExpanded && (
        <View style={[styles.content, { backgroundColor: theme.surface.card }]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
    minHeight: 60,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  content: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
});
