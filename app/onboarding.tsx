import DatePickerModal from '@/components/DatePickerModal';
import { saveUserProfile } from '@/services/database';
import { setOnboardingCompleted } from '@/services/onboardingService';
import { ActivityLevel, GoalType, UserProfile } from '@/services/db/schema';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, shadows, spacing, typography } from '../styles/theme';
import { useTheme } from '@/app/contexts/ThemeContext';
import { formatDateToYYYYMMDD } from '@/utils/dateHelpers';
import Ionicons from '@expo/vector-icons/Ionicons';

const activityLevels: Record<ActivityLevel, string> = {
  'sedentary': 'Sedentary',
  'lightly-active': 'Lightly Active',
  'moderately-active': 'Moderately Active',
  'very-active': 'Very Active',
  'extremely-active': 'Extremely Active',
};

const goalTypes: Record<GoalType, string> = {
  'lose-weight': 'Lose Weight',
  'maintain-weight': 'Maintain',
  'gain-weight': 'Gain Weight',
  'build-muscle': 'Build Muscle',
  'improve-fitness': 'Improve Fitness',
};

const initialProfile: Partial<UserProfile> = {
  gender: 'male',
  activityLevel: 'sedentary',
  goalType: 'maintain-weight',
  birthdate: '',
};

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>(initialProfile);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleUpdateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleFinish = async () => {
    if (!profile.birthdate || !profile.height || !profile.weight) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const birthdate = new Date(profile.birthdate);
    const ageDate = new Date(Date.now() - birthdate.getTime());
    const ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);

    const weightKg = profile.weight;
    const heightCm = profile.height;

    let bmr = 0;
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageYears);
    } else {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageYears);
    }

    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'extremely-active': 1.9,
    };

    const tdee = bmr * activityMultipliers[profile.activityLevel! as ActivityLevel];

    let targetCalories = tdee;
    if (profile.goalType === 'lose-weight') {
      targetCalories -= 500;
    } else if (profile.goalType === 'gain-weight') {
      targetCalories += 500;
    }

    const newProfile: UserProfile = {
      id: Date.now().toString(),
      birthdate: profile.birthdate,
      gender: profile.gender!,
      height: heightCm,
      weight: weightKg,
      activityLevel: profile.activityLevel!,
      goalType: profile.goalType!,
      targetWeight: profile.targetWeight || null,
      targetCalories,
      targetCarbs: (targetCalories * 0.4) / 4,
      targetProtein: (targetCalories * 0.3) / 4,
      targetFat: (targetCalories * 0.3) / 9,
      // Target micronutrients (not set during onboarding, default to null)
      targetVitaminA: null,
      targetVitaminC: null,
      targetVitaminD: null,
      targetVitaminB6: null,
      targetVitaminE: null,
      targetVitaminK: null,
      targetThiamin: null,
      targetVitaminB12: null,
      targetRiboflavin: null,
      targetFolate: null,
      targetNiacin: null,
      targetCholine: null,
      targetPantothenicAcid: null,
      targetBiotin: null,
      targetCarotenoids: null,
      targetCalcium: null,
      targetChloride: null,
      targetChromium: null,
      targetCopper: null,
      targetFluoride: null,
      targetIodine: null,
      targetIron: null,
      targetMagnesium: null,
      targetManganese: null,
      targetMolybdenum: null,
      targetPhosphorus: null,
      targetPotassium: null,
      targetSelenium: null,
      targetSodium: null,
      targetZinc: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveUserProfile(newProfile);
    await setOnboardingCompleted(true);
    router.replace('/(tabs)');
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.welcomeContent}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="fitness" size={64} color={theme.primary} />
              </View>
              <Text style={[styles.title, { color: theme.foreground }]}>Welcome to Fitness App!</Text>
              <Text style={[styles.subtitle, { color: theme.comment }]}>
                Your journey to a healthier you starts here. Let's set up your profile.
              </Text>
            </View>
            <Pressable
              style={[styles.buttonSingle, { backgroundColor: theme.primary }, shadows.md]}
              onPress={handleNext}
              android_ripple={{ color: theme.surface.elevated }}
            >
              <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.text.inverse} />
            </Pressable>
          </View>
        );
      case 1:
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <View style={[styles.progressContainer, { backgroundColor: theme.surface.card }]}>
              <View style={[styles.progressBar, { width: '33%', backgroundColor: theme.primary }]} />
            </View>
            <Text style={[styles.stepNumber, { color: theme.comment }]}>Step 1 of 3</Text>
            <Text style={[styles.title, { color: theme.foreground }]}>Your Details</Text>
            <Text style={[styles.description, { color: theme.comment }]}>
              Tell us about yourself so we can calculate your nutritional needs
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.foreground }]}>Birthdate</Text>
              <Pressable
                onPress={() => setDatePickerVisibility(true)}
                style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}
                android_ripple={{ color: theme.selection }}
              >
                <Ionicons name="calendar-outline" size={20} color={theme.comment} style={styles.inputIcon} />
                <Text style={[styles.inputText, { color: profile.birthdate ? theme.foreground : theme.comment }]}>
                  {profile.birthdate || 'Select your birthdate'}
                </Text>
              </Pressable>
              <DatePickerModal
                isVisible={isDatePickerVisible}
                onClose={() => setDatePickerVisibility(false)}
                onSelectDate={(date) => { handleUpdateProfile('birthdate', formatDateToYYYYMMDD(date)) }}
                currentDate={profile.birthdate ? new Date(profile.birthdate) : new Date()}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.foreground }]}>Gender</Text>
              <View style={[styles.segmentedControl, { backgroundColor: theme.surface.input }, shadows.sm]}>
                {[
                  { value: 'male', icon: 'male', label: 'Male' },
                  { value: 'female', icon: 'female', label: 'Female' }
                ].map((g) => (
                  <Pressable
                    key={g.value}
                    style={[
                      styles.segment,
                      profile.gender === g.value && { backgroundColor: theme.primary }
                    ]}
                    onPress={() => handleUpdateProfile('gender', g.value as 'male' | 'female')}
                    android_ripple={{ color: theme.selection }}
                  >
                    <Ionicons
                      name={g.icon as any}
                      size={24}
                      color={profile.gender === g.value ? theme.text.inverse : theme.foreground}
                    />
                    <Text style={[
                      styles.segmentText,
                      { color: theme.foreground },
                      profile.gender === g.value && { color: theme.text.inverse, fontWeight: typography.weights.bold }
                    ]}>
                      {g.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formHalf]}>
                <Text style={[styles.label, { color: theme.foreground }]}>Height (cm)</Text>
                <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
                  <Ionicons name="resize-outline" size={20} color={theme.comment} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.foreground }]}
                    placeholder="180"
                    placeholderTextColor={theme.comment}
                    keyboardType="numeric"
                    value={profile.height?.toString()}
                    onChangeText={(text) => handleUpdateProfile('height', text ? parseFloat(text) : undefined)}
                  />
                </View>
              </View>
              <View style={[styles.formGroup, styles.formHalf]}>
                <Text style={[styles.label, { color: theme.foreground }]}>Weight (kg)</Text>
                <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
                  <Ionicons name="barbell-outline" size={20} color={theme.comment} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.foreground }]}
                    placeholder="75"
                    placeholderTextColor={theme.comment}
                    keyboardType="numeric"
                    value={profile.weight?.toString()}
                    onChangeText={(text) => handleUpdateProfile('weight', text ? parseFloat(text) : undefined)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.buttonGroup}>
              <Pressable
                style={[styles.buttonSecondary, { backgroundColor: theme.surface.card, borderColor: theme.comment, borderWidth: 2 }]}
                onPress={handlePrev}
                android_ripple={{ color: theme.selection }}
              >
                <Ionicons name="arrow-back" size={20} color={theme.foreground} />
                <Text style={[styles.buttonSecondaryText, { color: theme.foreground }]}>Back</Text>
              </Pressable>
              <Pressable
                style={[styles.button, { backgroundColor: theme.primary }, shadows.md]}
                onPress={handleNext}
                android_ripple={{ color: theme.surface.elevated }}
              >
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.text.inverse} />
              </Pressable>
            </View>
          </ScrollView>
        );
      case 2:
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <View style={[styles.progressContainer, { backgroundColor: theme.surface.card }]}>
              <View style={[styles.progressBar, { width: '66%', backgroundColor: theme.primary }]} />
            </View>
            <Text style={[styles.stepNumber, { color: theme.comment }]}>Step 2 of 3</Text>
            <Text style={[styles.title, { color: theme.foreground }]}>Activity Level</Text>
            <Text style={[styles.description, { color: theme.comment }]}>
              How active are you on a typical day?
            </Text>

            <View style={styles.optionsList}>
              {Object.entries(activityLevels).map(([level, label]) => (
                <Pressable
                  key={level}
                  style={[
                    styles.optionCard,
                    { backgroundColor: theme.surface.card },
                    profile.activityLevel === level && { backgroundColor: theme.primary, borderColor: theme.primary },
                    shadows.sm
                  ]}
                  onPress={() => handleUpdateProfile('activityLevel', level as ActivityLevel)}
                  android_ripple={{ color: theme.selection }}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.radioOuter,
                      { borderColor: profile.activityLevel === level ? theme.text.inverse : theme.comment }
                    ]}>
                      {profile.activityLevel === level && (
                        <View style={[styles.radioInner, { backgroundColor: theme.text.inverse }]} />
                      )}
                    </View>
                    <Text style={[
                      styles.optionText,
                      { color: theme.foreground },
                      profile.activityLevel === level && { color: theme.text.inverse, fontWeight: typography.weights.bold }
                    ]}>
                      {label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <View style={styles.buttonGroup}>
              <Pressable
                style={[styles.buttonSecondary, { backgroundColor: theme.surface.card, borderColor: theme.comment, borderWidth: 2 }]}
                onPress={handlePrev}
                android_ripple={{ color: theme.selection }}
              >
                <Ionicons name="arrow-back" size={20} color={theme.foreground} />
                <Text style={[styles.buttonSecondaryText, { color: theme.foreground }]}>Back</Text>
              </Pressable>
              <Pressable
                style={[styles.button, { backgroundColor: theme.primary }, shadows.md]}
                onPress={handleNext}
                android_ripple={{ color: theme.surface.elevated }}
              >
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.text.inverse} />
              </Pressable>
            </View>
          </ScrollView>
        );
      case 3:
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <View style={[styles.progressContainer, { backgroundColor: theme.surface.card }]}>
              <View style={[styles.progressBar, { width: '100%', backgroundColor: theme.primary }]} />
            </View>
            <Text style={[styles.stepNumber, { color: theme.comment }]}>Step 3 of 3</Text>
            <Text style={[styles.title, { color: theme.foreground }]}>Your Goal</Text>
            <Text style={[styles.description, { color: theme.comment }]}>
              What would you like to achieve?
            </Text>

            <View style={styles.optionsList}>
              {Object.entries(goalTypes).map(([goal, label]) => (
                <Pressable
                  key={goal}
                  style={[
                    styles.optionCard,
                    { backgroundColor: theme.surface.card },
                    profile.goalType === goal && { backgroundColor: theme.primary, borderColor: theme.primary },
                    shadows.sm
                  ]}
                  onPress={() => handleUpdateProfile('goalType', goal as GoalType)}
                  android_ripple={{ color: theme.selection }}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.radioOuter,
                      { borderColor: profile.goalType === goal ? theme.text.inverse : theme.comment }
                    ]}>
                      {profile.goalType === goal && (
                        <View style={[styles.radioInner, { backgroundColor: theme.text.inverse }]} />
                      )}
                    </View>
                    <Text style={[
                      styles.optionText,
                      { color: theme.foreground },
                      profile.goalType === goal && { color: theme.text.inverse, fontWeight: typography.weights.bold }
                    ]}>
                      {label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {(profile.goalType === 'lose-weight' || profile.goalType === 'gain-weight') && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.foreground }]}>Target Weight (kg)</Text>
                <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
                  <Ionicons name="flag-outline" size={20} color={theme.comment} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.foreground }]}
                    placeholder="70"
                    placeholderTextColor={theme.comment}
                    keyboardType="numeric"
                    value={profile.targetWeight?.toString()}
                    onChangeText={(text) => handleUpdateProfile('targetWeight', parseFloat(text))}
                  />
                </View>
              </View>
            )}

            <View style={styles.buttonGroup}>
              <Pressable
                style={[styles.buttonSecondary, { backgroundColor: theme.surface.card, borderColor: theme.comment, borderWidth: 2 }]}
                onPress={handlePrev}
                android_ripple={{ color: theme.selection }}
              >
                <Ionicons name="arrow-back" size={20} color={theme.foreground} />
                <Text style={[styles.buttonSecondaryText, { color: theme.foreground }]}>Back</Text>
              </Pressable>
              <Pressable
                style={[styles.button, { backgroundColor: theme.success }, shadows.md]}
                onPress={handleFinish}
                android_ripple={{ color: theme.surface.elevated }}
              >
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Finish</Text>
                <Ionicons name="checkmark-circle" size={20} color={theme.text.inverse} />
              </Pressable>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: '100%',
    padding: spacing.xl,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  progressContainer: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  stepNumber: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    marginBottom: spacing.xxl,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.md,
  },
  description: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Form Styles
  formGroup: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  formHalf: {
    flex: 1,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  inputText: {
    fontSize: typography.sizes.md,
    flex: 1,
  },
  textInput: {
    fontSize: typography.sizes.md,
    flex: 1,
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    minHeight: 56,
  },
  segmentText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },

  // Options List
  optionsList: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionCard: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    flex: 1,
  },

  // Buttons
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: 56,
  },
  buttonSingle: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: 56,
  },
  buttonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  buttonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: 56,
  },
  buttonSecondaryText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
