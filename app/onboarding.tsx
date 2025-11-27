import DatePickerModal from '@/app/components/DatePickerModal';
import { saveUserProfile } from '@/services/database';
import { setOnboardingCompleted } from '@/services/onboardingService';
import { ActivityLevel, GoalType, UserProfile } from '@/services/db/schema';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, spacing, typography } from '../styles/theme';
import { useTheme } from '@/app/contexts/ThemeContext';
import { formatDateToYYYYMMDD } from './utils/dateHelpers';

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
            <Text style={[styles.title, { color: theme.foreground }]}>Welcome to Fitness App!</Text>
            <Text style={[styles.subtitle, { color: theme.comment }]}>Your journey to a healthier you starts here.</Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.cyan }]} onPress={handleNext}>
              <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Get Started</Text>
            </TouchableOpacity>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: theme.foreground }]}>Your Details</Text>
            <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={[styles.input, { backgroundColor: theme.surface.input }]}>
              <Text style={[styles.datePickerText, { color: theme.foreground }]}>{profile.birthdate ? profile.birthdate : 'Select your birthdate'}</Text>
            </TouchableOpacity>
            <DatePickerModal
              isVisible={isDatePickerVisible}
              onClose={() => setDatePickerVisibility(false)}
              onSelectDate={(date) => { handleUpdateProfile('birthdate', formatDateToYYYYMMDD(date)) }}
              currentDate={profile.birthdate ? new Date(profile.birthdate) : new Date()}
            />
            <View style={[styles.segmentedControl, { backgroundColor: theme.surface.secondary }]}>
              {['male', 'female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.segment, profile.gender === g && [styles.segmentActive, { backgroundColor: theme.primary }]]}
                  onPress={() => handleUpdateProfile('gender', g as 'male' | 'female')}
                >
                  <Text style={[styles.segmentText, { color: theme.foreground }, profile.gender === g && [styles.segmentTextActive, { color: theme.text.inverse }]]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]} placeholder="Height (cm)" placeholderTextColor={theme.comment} keyboardType="numeric" value={profile.height?.toString()} onChangeText={(text) => {
              handleUpdateProfile('height', text ? parseFloat(text) : undefined)
            }
            } />
            <TextInput style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]} placeholder="Weight (kg)" placeholderTextColor={theme.comment} keyboardType="numeric" value={profile.weight?.toString()} onChangeText={(text) => {
              handleUpdateProfile('weight', text ? parseFloat(text) : undefined)
            }
            } />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.cyan }]} onPress={handlePrev}>
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.cyan }]} onPress={handleNext}>
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: theme.foreground }]}>Your Activity Level</Text>
            <View style={[styles.segmentedControl, { backgroundColor: theme.surface.secondary }]}>
              {Object.keys(activityLevels).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.segment, profile.activityLevel === level && [styles.segmentActive, { backgroundColor: theme.primary }]]}
                  onPress={() => handleUpdateProfile('activityLevel', level as ActivityLevel)}
                >
                  <Text style={[styles.segmentText, { color: theme.foreground }, profile.activityLevel === level && [styles.segmentTextActive, { color: theme.text.inverse }]]}>{activityLevels[level as ActivityLevel]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.cyan }]} onPress={handlePrev}>
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.cyan }]} onPress={handleNext}>
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: theme.foreground }]}>Your Goal</Text>
            <View style={[styles.segmentedControl, { backgroundColor: theme.surface.secondary }]}>
              {Object.keys(goalTypes).map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[styles.segment, profile.goalType === goal && [styles.segmentActive, { backgroundColor: theme.primary }]]}
                  onPress={() => handleUpdateProfile('goalType', goal as GoalType)}
                >
                  <Text style={[styles.segmentText, { color: theme.foreground }, profile.goalType === goal && [styles.segmentTextActive, { color: theme.text.inverse }]]}>{goalTypes[goal as GoalType]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {(profile.goalType === 'lose-weight' || profile.goalType === 'gain-weight') && (
              <TextInput style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]} placeholder="Target Weight (kg)" placeholderTextColor={theme.comment} keyboardType="numeric" value={profile.targetWeight?.toString()} onChangeText={(text) => handleUpdateProfile('targetWeight', parseFloat(text))} />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.cyan }]} onPress={handlePrev}>
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.cyan }]} onPress={handleFinish}>
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  stepContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    width: '100%',
    marginBottom: spacing.md,
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: typography.sizes.md,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
  },
  buttonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.lg,
  },
  segmentedControl: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  segment: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexBasis: '48%',
    margin: '1%',
  },
  segmentActive: {
  },
  segmentText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  segmentTextActive: {
    fontWeight: typography.weights.bold,
  },
});
