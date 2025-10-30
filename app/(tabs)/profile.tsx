import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getUserProfile, saveUserProfile } from '@/services/database';
import { resetDatabase } from '@/services/db';
import { UserProfile, ActivityLevel, GoalType, VitaminFields, MineralFields } from '@/types/types'
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { setOnboardingCompleted } from '@/services/onboardingService';
import { useRouter } from 'expo-router';
import DatePickerModal from '@/app/components/DatePickerModal';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('sedentary');
  const [goalType, setGoalType] = useState<GoalType>('maintain-weight');
  const [targetWeight, setTargetWeight] = useState('');
  const [vitaminTargets, setVitaminTargets] = useState<VitaminFields>({});
  const [mineralTargets, setMineralTargets] = useState<MineralFields>({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showVitaminTargets, setShowVitaminTargets] = useState(false);
  const [showMineralTargets, setShowMineralTargets] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const userProfile = getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      setBirthdate(userProfile.birthdate);
      setGender(userProfile.gender);
      setHeight(userProfile.height.toString());
      setWeight(userProfile.weight.toString());
      setActivityLevel(userProfile.activityLevel);
      setGoalType(userProfile.goalType);
      setTargetWeight(userProfile.targetWeight?.toString() || '');
    }
  };

  const handleSaveProfile = () => {
    if (!birthdate || !height || !weight) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const birthDate = new Date(birthdate);
    const ageDate = new Date(Date.now() - birthDate.getTime());
    const ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Basic BMR and TDEE calculation
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);

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
      birthdate: birthdate,
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

  const handleResetOnboarding = async () => {
    await setOnboardingCompleted(false);
    router.replace('/onboarding');
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'Are you sure you want to reset the entire database? All your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetDatabase();
            setOnboardingCompleted(false); // Also reset onboarding after db reset
            router.replace('/onboarding');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setShowProfileInfo(!showProfileInfo)}>
        <Text style={styles.title}>Your Profile</Text>
        <Ionicons name={showProfileInfo ? "chevron-up" : "chevron-down"} size={24} color={draculaTheme.foreground} />
      </TouchableOpacity>

      {showProfileInfo && (
        <View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birthdate</Text>
            <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.input}>
              <Text style={styles.datePickerText}>{birthdate ? birthdate : 'Select your birthdate'}</Text>
            </TouchableOpacity>
            <DatePickerModal
              isVisible={isDatePickerVisible}
              onClose={() => setDatePickerVisibility(false)}
              onSelectDate={(date) => setBirthdate(date.toISOString().split('T')[0])}
              currentDate={birthdate ? new Date(birthdate) : new Date()}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.segmentedControl}>
              {['male', 'female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.segment, gender === g && styles.segmentActive]}
                  onPress={() => setGender(g as 'male' | 'female')}
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
        </View>
      )}

      <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setShowVitaminTargets(!showVitaminTargets)}>
        <Text style={styles.title}>Vitamin Targets</Text>
        <Ionicons name={showVitaminTargets ? "chevron-up" : "chevron-down"} size={24} color={draculaTheme.foreground} />
      </TouchableOpacity>

      {showVitaminTargets && (
        <View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vitamin A (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Vitamin A"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminA?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminA: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vitamin C (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Vitamin C"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminC?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminC: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vitamin D (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Vitamin D"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminD?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminD: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vitamin B6 (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Vitamin B6"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminB6?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminB6: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vitamin E (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Vitamin E"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminE?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminE: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vitamin K (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Vitamin K"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminK?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminK: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thiamin (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Thiamin"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.thiamin?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, thiamin: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vitamin B12 (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Vitamin B12"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminB12?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminB12: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Riboflavin (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Riboflavin"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.riboflavin?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, riboflavin: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Folate (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Folate"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.folate?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, folate: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Niacin (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Niacin"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.niacin?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, niacin: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Choline (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Choline"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.choline?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, choline: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pantothenic Acid (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Pantothenic Acid"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.pantothenicAcid?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, pantothenicAcid: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biotin (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Biotin"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.biotin?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, biotin: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Carotenoids (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Carotenoids"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={vitaminTargets.carotenoids?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, carotenoids: parseFloat(text) || undefined })}
            />
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setShowMineralTargets(!showMineralTargets)}>
        <Text style={styles.title}>Mineral Targets</Text>
        <Ionicons name={showMineralTargets ? "chevron-up" : "chevron-down"} size={24} color={draculaTheme.foreground} />
      </TouchableOpacity>

      {showMineralTargets && (
        <View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calcium (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Calcium"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.calcium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, calcium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chloride (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Chloride"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.chloride?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, chloride: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chromium (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Chromium"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.chromium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, chromium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Copper (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Copper"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.copper?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, copper: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fluoride (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Fluoride"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.fluoride?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, fluoride: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Iodine (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Iodine"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.iodine?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, iodine: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Iron (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Iron"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.iron?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, iron: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Magnesium (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Magnesium"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.magnesium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, magnesium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Manganese (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Manganese"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.manganese?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, manganese: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Molybdenum (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Molybdenum"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.molybdenum?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, molybdenum: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phosphorus (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Phosphorus"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.phosphorus?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, phosphorus: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Potassium (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Potassium"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.potassium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, potassium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Selenium (mcg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Selenium"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.selenium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, selenium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sodium (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Sodium"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.sodium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, sodium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zinc (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter target Zinc"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={mineralTargets.zinc?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, zinc: parseFloat(text) || undefined })}
            />
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={handleResetOnboarding}>
        <Text style={styles.resetButtonText}>Reset Onboarding</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={handleResetDatabase}>
        <Text style={styles.resetButtonText}>Reset Database</Text>
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
    justifyContent: 'center',
    height: 50,
  },
  datePickerText: {
    fontSize: typography.sizes.md,
    color: draculaTheme.foreground,
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
    flexBasis: '48%',
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
  resetButton: {
    backgroundColor: draculaTheme.red,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resetButtonText: {
    fontSize: typography.sizes.lg,
    color: draculaTheme.text.inverse,
    fontWeight: typography.weights.bold,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
