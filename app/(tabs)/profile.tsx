
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getUserProfile, saveUserProfile, UserProfile, ActivityLevel, GoalType } from '../../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../../styles/theme';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('sedentary');
  const [goalType, setGoalType] = useState<GoalType>('maintain-weight');
  const [targetWeight, setTargetWeight] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const userProfile = getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      setAge(userProfile.age.toString());
      setGender(userProfile.gender);
      setHeight(userProfile.height.toString());
      setWeight(userProfile.weight.toString());
      setActivityLevel(userProfile.activityLevel);
      setGoalType(userProfile.goalType);
      setTargetWeight(userProfile.targetWeight?.toString() || '');
    }
  };

  const handleSaveProfile = () => {
    if (!age || !height || !weight) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Basic BMR and TDEE calculation
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseInt(age);

    let bmr = 0;
    if (gender === 'male') {
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

    const tdee = bmr * activityMultipliers[activityLevel];

    let targetCalories = tdee;
    if (goalType === 'lose-weight') {
      targetCalories -= 500;
    } else if (goalType === 'gain-weight') {
      targetCalories += 500;
    }

    const newProfile: UserProfile = {
      id: profile?.id || Date.now().toString(),
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      activityLevel,
      goalType,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      targetCalories,
      // Simple macro split: 40% carbs, 30% protein, 30% fat
      targetCarbs: (targetCalories * 0.4) / 4,
      targetProtein: (targetCalories * 0.3) / 4,
      targetFat: (targetCalories * 0.3) / 9,
      createdAt: profile?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    saveUserProfile(newProfile);
    Alert.alert('Success', 'Profile saved successfully!');
    loadProfile();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <Text style={styles.title}>Your Profile</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your age"
          placeholderTextColor={draculaTheme.comment}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.segmentedControl}>
          {['male', 'female', 'other'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.segment, gender === g && styles.segmentActive]}
              onPress={() => setGender(g as 'male' | 'female' | 'other')}
            >
              <Text style={[styles.segmentText, gender === g && styles.segmentTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your height"
          placeholderTextColor={draculaTheme.comment}
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your weight"
          placeholderTextColor={draculaTheme.comment}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Activity Level</Text>
        <View style={styles.segmentedControl}>
          {Object.keys(activityLevels).map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.segment, activityLevel === level && styles.segmentActive]}
              onPress={() => setActivityLevel(level as ActivityLevel)}
            >
              <Text style={[styles.segmentText, activityLevel === level && styles.segmentTextActive]}>{activityLevels[level as ActivityLevel]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Goal</Text>
        <View style={styles.segmentedControl}>
          {Object.keys(goalTypes).map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[styles.segment, goalType === goal && styles.segmentActive]}
              onPress={() => setGoalType(goal as GoalType)}
            >
              <Text style={[styles.segmentText, goalType === goal && styles.segmentTextActive]}>{goalTypes[goal as GoalType]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {(goalType === 'lose-weight' || goalType === 'gain-weight') && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your target weight"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={targetWeight}
            onChangeText={setTargetWeight}
          />
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  scrollContentContainer: {
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.heading,
    color: draculaTheme.foreground,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    color: draculaTheme.foreground,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: draculaTheme.surface.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
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
  saveButton: {
    backgroundColor: draculaTheme.green,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    fontSize: typography.sizes.lg,
    color: draculaTheme.text.inverse,
    fontWeight: typography.weights.bold,
  },
});
