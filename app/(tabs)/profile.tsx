import DatePickerModal from '@/app/components/DatePickerModal';
import { useTheme } from '@/app/contexts/ThemeContext';
import { getUserProfile, saveUserProfile } from '@/services/database';
import { resetDatabase } from '@/services/db';
import { ActivityLevel, GoalType, UserProfile } from '@/services/db/schema';
import { setOnboardingCompleted } from '@/services/onboardingService';
import { borderRadius, spacing, typography, ThemeName } from '@/styles/theme';
import { MineralFields, VitaminFields } from '@/types/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { theme, themeName, setTheme } = useTheme();
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
      setGender(userProfile.gender as 'male' | 'female');
      setHeight(userProfile.height.toString());
      setWeight(userProfile.weight.toString());
      setActivityLevel(userProfile.activityLevel as ActivityLevel);
      setGoalType(userProfile.goalType as GoalType);
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
      targetWeight: targetWeight ? parseFloat(targetWeight) : null,
      targetCalories,
      // Simple macro split: 40% carbs, 30% protein, 30% fat
      targetCarbs: (targetCalories * 0.4) / 4,
      targetProtein: (targetCalories * 0.3) / 4,
      targetFat: (targetCalories * 0.3) / 9,
      // Target micronutrients (not set by user, default to null)
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContentContainer}>
      <TouchableOpacity style={[styles.collapsibleHeader, { backgroundColor: theme.surface.card }]} onPress={() => {}}>
        <Text style={[styles.title, { color: theme.foreground }]}>Theme</Text>
      </TouchableOpacity>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>App Theme</Text>
        <View style={[styles.segmentedControl, { backgroundColor: theme.surface.secondary }]}>
          <TouchableOpacity
            style={[styles.segment, themeName === 'dracula' && { backgroundColor: theme.primary }]}
            onPress={() => setTheme('dracula')}
          >
            <Text style={[styles.segmentText, { color: theme.foreground }, themeName === 'dracula' && { color: theme.text.inverse, fontWeight: typography.weights.bold }]}>Dark</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, themeName === 'light' && { backgroundColor: theme.primary }]}
            onPress={() => setTheme('light')}
          >
            <Text style={[styles.segmentText, { color: theme.foreground }, themeName === 'light' && { color: theme.text.inverse, fontWeight: typography.weights.bold }]}>Light</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={[styles.collapsibleHeader, { backgroundColor: theme.surface.card }]} onPress={() => setShowProfileInfo(!showProfileInfo)}>
        <Text style={[styles.title, { color: theme.foreground }]}>Your Profile</Text>
        <Ionicons name={showProfileInfo ? "chevron-up" : "chevron-down"} size={24} color={theme.foreground} />
      </TouchableOpacity>

      {showProfileInfo && (
        <View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Birthdate</Text>
            <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={[styles.input, { backgroundColor: theme.surface.input }]}>
              <Text style={[styles.datePickerText, { color: theme.foreground }]}>{birthdate ? birthdate : 'Select your birthdate'}</Text>
            </TouchableOpacity>
            <DatePickerModal
              isVisible={isDatePickerVisible}
              onClose={() => setDatePickerVisibility(false)}
              onSelectDate={(date) => setBirthdate(date.toISOString().split('T')[0])}
              currentDate={birthdate ? new Date(birthdate) : new Date()}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Gender</Text>
            <View style={[styles.segmentedControl, { backgroundColor: theme.surface.secondary }]}>
              {['male', 'female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.segment, gender === g && { backgroundColor: theme.primary }]}
                  onPress={() => setGender(g as 'male' | 'female')}
                >
                  <Text style={[styles.segmentText, { color: theme.foreground }, gender === g && { color: theme.text.inverse, fontWeight: typography.weights.bold }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Height (cm)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter your height"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Weight (kg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter your weight"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Activity Level</Text>
            <View style={[styles.segmentedControl, { backgroundColor: theme.surface.secondary }]}>
              {Object.keys(activityLevels).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.segment, activityLevel === level && { backgroundColor: theme.primary }]}
                  onPress={() => setActivityLevel(level as ActivityLevel)}
                >
                  <Text style={[styles.segmentText, { color: theme.foreground }, activityLevel === level && { color: theme.text.inverse, fontWeight: typography.weights.bold }]}>{activityLevels[level as ActivityLevel]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Goal</Text>
            <View style={[styles.segmentedControl, { backgroundColor: theme.surface.secondary }]}>
              {Object.keys(goalTypes).map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[styles.segment, goalType === goal && { backgroundColor: theme.primary }]}
                  onPress={() => setGoalType(goal as GoalType)}
                >
                  <Text style={[styles.segmentText, { color: theme.foreground }, goalType === goal && { color: theme.text.inverse, fontWeight: typography.weights.bold }]}>{goalTypes[goal as GoalType]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {(goalType === 'lose-weight' || goalType === 'gain-weight') && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.foreground }]}>Target Weight (kg)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
                placeholder="Enter your target weight"
                placeholderTextColor={theme.comment}
                keyboardType="numeric"
                value={targetWeight}
                onChangeText={setTargetWeight}
              />
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={[styles.collapsibleHeader, { backgroundColor: theme.surface.card }]} onPress={() => setShowVitaminTargets(!showVitaminTargets)}>
        <Text style={[styles.title, { color: theme.foreground }]}>Vitamin Targets</Text>
        <Ionicons name={showVitaminTargets ? "chevron-up" : "chevron-down"} size={24} color={theme.foreground} />
      </TouchableOpacity>

      {showVitaminTargets && (
        <View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Vitamin A (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Vitamin A"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminA?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminA: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Vitamin C (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Vitamin C"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminC?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminC: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Vitamin D (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Vitamin D"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminD?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminD: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Vitamin B6 (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Vitamin B6"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminB6?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminB6: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Vitamin E (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Vitamin E"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminE?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminE: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Vitamin K (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Vitamin K"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminK?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminK: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Thiamin (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Thiamin"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.thiamin?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, thiamin: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Vitamin B12 (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Vitamin B12"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.vitaminB12?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, vitaminB12: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Riboflavin (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Riboflavin"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.riboflavin?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, riboflavin: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Folate (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Folate"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.folate?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, folate: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Niacin (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Niacin"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.niacin?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, niacin: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Choline (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Choline"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.choline?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, choline: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Pantothenic Acid (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Pantothenic Acid"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.pantothenicAcid?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, pantothenicAcid: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Biotin (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Biotin"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.biotin?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, biotin: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Carotenoids (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Carotenoids"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={vitaminTargets.carotenoids?.toString() || ''}
              onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, carotenoids: parseFloat(text) || undefined })}
            />
          </View>
        </View>
      )}

      <TouchableOpacity style={[styles.collapsibleHeader, { backgroundColor: theme.surface.card }]} onPress={() => setShowMineralTargets(!showMineralTargets)}>
        <Text style={[styles.title, { color: theme.foreground }]}>Mineral Targets</Text>
        <Ionicons name={showMineralTargets ? "chevron-up" : "chevron-down"} size={24} color={theme.foreground} />
      </TouchableOpacity>

      {showMineralTargets && (
        <View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Calcium (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Calcium"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.calcium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, calcium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Chloride (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Chloride"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.chloride?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, chloride: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Chromium (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Chromium"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.chromium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, chromium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Copper (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Copper"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.copper?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, copper: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Fluoride (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Fluoride"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.fluoride?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, fluoride: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Iodine (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Iodine"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.iodine?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, iodine: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Iron (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Iron"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.iron?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, iron: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Magnesium (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Magnesium"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.magnesium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, magnesium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Manganese (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Manganese"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.manganese?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, manganese: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Molybdenum (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Molybdenum"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.molybdenum?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, molybdenum: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Phosphorus (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Phosphorus"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.phosphorus?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, phosphorus: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Potassium (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Potassium"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.potassium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, potassium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Selenium (mcg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Selenium"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.selenium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, selenium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Sodium (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Sodium"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.sodium?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, sodium: parseFloat(text) || undefined })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Zinc (mg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Enter target Zinc"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={mineralTargets.zinc?.toString() || ''}
              onChangeText={(text) => setMineralTargets({ ...mineralTargets, zinc: parseFloat(text) || undefined })}
            />
          </View>
        </View>
      )}

      <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.green }]} onPress={handleSaveProfile}>
        <Text style={[styles.saveButtonText, { color: theme.text.inverse }]}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.resetButton, { backgroundColor: theme.red }]} onPress={handleResetOnboarding}>
        <Text style={[styles.resetButtonText, { color: theme.text.inverse }]}>Reset Onboarding</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.resetButton, { backgroundColor: theme.red }]} onPress={handleResetDatabase}>
        <Text style={[styles.resetButtonText, { color: theme.text.inverse }]}>Reset Database</Text>
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
    padding: spacing.md,
  },
  scrollContentContainer: {
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    justifyContent: 'center',
    height: 50,
  },
  datePickerText: {
    fontSize: typography.sizes.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
    // Removed - backgroundColor applied inline
  },
  segmentText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  segmentTextActive: {
    // Removed - color and fontWeight applied inline
  },
  saveButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  resetButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resetButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
