import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { setOnboardingCompleted } from '../services/onboardingService';
import { useRouter } from 'expo-router';
import { draculaTheme, spacing, typography, borderRadius } from '../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveUserProfile, UserProfile, ActivityLevel, GoalType } from '../services/database';

const activityLevels: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
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
};

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>(initialProfile);

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
    if (!profile.age || !profile.height || !profile.weight) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const weightKg = profile.weight;
    const heightCm = profile.height;
    const ageYears = profile.age;

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

    const tdee = bmr * activityMultipliers[profile.activityLevel!];

    let targetCalories = tdee;
    if (profile.goalType === 'lose-weight') {
      targetCalories -= 500;
    } else if (profile.goalType === 'gain-weight') {
      targetCalories += 500;
    }

    const newProfile: UserProfile = {
      id: Date.now().toString(),
      age: ageYears,
      gender: profile.gender!,
      height: heightCm,
      weight: weightKg,
      activityLevel: profile.activityLevel!,
      goalType: profile.goalType!,
      targetWeight: profile.targetWeight,
      targetCalories,
      targetCarbs: (targetCalories * 0.4) / 4,
      targetProtein: (targetCalories * 0.3) / 4,
      targetFat: (targetCalories * 0.3) / 9,
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
            <Text style={styles.title}>Welcome to Fitness App!</Text>
            <Text style={styles.subtitle}>Your journey to a healthier you starts here.</Text>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Your Details</Text>
            <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" value={profile.age?.toString()} onChangeText={(text) => handleUpdateProfile('age', parseInt(text))} />
            <View style={styles.segmentedControl}>
              {['male', 'female', 'other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.segment, profile.gender === g && styles.segmentActive]}
                  onPress={() => handleUpdateProfile('gender', g as 'male' | 'female' | 'other')}
                >
                  <Text style={[styles.segmentText, profile.gender === g && styles.segmentTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Height (cm)" keyboardType="numeric" value={profile.height?.toString()} onChangeText={(text) => handleUpdateProfile('height', parseFloat(text))} />
            <TextInput style={styles.input} placeholder="Weight (kg)" keyboardType="numeric" value={profile.weight?.toString()} onChangeText={(text) => handleUpdateProfile('weight', parseFloat(text))} />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handlePrev}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Your Activity Level</Text>
            <View style={styles.segmentedControl}>
              {Object.keys(activityLevels).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.segment, profile.activityLevel === level && styles.segmentActive]}
                  onPress={() => handleUpdateProfile('activityLevel', level as ActivityLevel)}
                >
                  <Text style={[styles.segmentText, profile.activityLevel === level && styles.segmentTextActive]}>{activityLevels[level as ActivityLevel]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handlePrev}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Your Goal</Text>
            <View style={styles.segmentedControl}>
              {Object.keys(goalTypes).map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[styles.segment, profile.goalType === goal && styles.segmentActive]}
                  onPress={() => handleUpdateProfile('goalType', goal as GoalType)}
                >
                  <Text style={[styles.segmentText, profile.goalType === goal && styles.segmentTextActive]}>{goalTypes[goal as GoalType]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {(profile.goalType === 'lose-weight' || profile.goalType === 'gain-weight') && (
              <TextInput style={styles.input} placeholder="Target Weight (kg)" keyboardType="numeric" value={profile.targetWeight?.toString()} onChangeText={(text) => handleUpdateProfile('targetWeight', parseFloat(text))} />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handlePrev}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleFinish}>
                <Text style={styles.buttonText}>Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {renderStep()}
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
  stepContainer: {
    width: '100%',
    alignItems: 'center',
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
  input: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    width: '100%',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: draculaTheme.cyan,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
  },
  buttonText: {
    color: draculaTheme.text.inverse,
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
    backgroundColor: draculaTheme.surface.secondary,
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
    flexBasis: '30%',
    margin: '1%',
  },
  segmentActive: {
    backgroundColor: draculaTheme.primary,
  },
  segmentText: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.foreground,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: draculaTheme.text.inverse,
    fontWeight: typography.weights.bold,
  },
});
