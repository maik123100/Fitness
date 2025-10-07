import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { setOnboardingCompleted } from '../services/onboardingService';
import { useRouter } from 'expo-router';
import { draculaTheme, spacing, typography, borderRadius } from '../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGetStarted = async () => {
    await setOnboardingCompleted(true);
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>Welcome to Fitness App!</Text>
      <Text style={styles.subtitle}>Your journey to a healthier you starts here.</Text>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: draculaTheme.comment,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: draculaTheme.cyan,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
