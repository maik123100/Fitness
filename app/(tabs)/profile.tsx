import DatePickerModal from '@/app/components/DatePickerModal';
import { useTheme } from '@/app/contexts/ThemeContext';
import { getUserProfile, saveUserProfile } from '@/services/database';
import { resetDatabase } from '@/services/db';
import { ActivityLevel, GoalType, UserProfile } from '@/services/db/schema';
import { setOnboardingCompleted } from '@/services/onboardingService';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import { MineralFields, VitaminFields } from '@/types/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
  const [showAppearance, setShowAppearance] = useState(false);
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
      targetCarbs: (targetCalories * 0.4) / 4,
      targetProtein: (targetCalories * 0.3) / 4,
      targetFat: (targetCalories * 0.3) / 9,
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
            setOnboardingCompleted(false);
            router.replace('/onboarding');
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Collapsible Section Component
  const CollapsibleSection = ({ 
    title, 
    isExpanded, 
    onToggle, 
    children,
    icon 
  }: { 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
    icon?: keyof typeof Ionicons.glyphMap;
  }) => {
    const rotation = useSharedValue(isExpanded ? 180 : 0);

    useEffect(() => {
      rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 300 });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded]);

    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
      <View style={styles.sectionContainer}>
        <Pressable 
          style={[styles.sectionHeader, { backgroundColor: theme.surface.card }, shadows.sm]} 
          onPress={onToggle}
          android_ripple={{ color: theme.selection }}
        >
          <View style={styles.sectionHeaderContent}>
            {icon && <Ionicons name={icon} size={24} color={theme.primary} style={styles.sectionIcon} />}
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{title}</Text>
          </View>
          <Animated.View style={animatedIconStyle}>
            <Ionicons name="chevron-down" size={24} color={theme.comment} />
          </Animated.View>
        </Pressable>

        {isExpanded && (
          <View style={[styles.sectionContent, { backgroundColor: theme.surface.card }]}>
            {children}
          </View>
        )}
      </View>
    );
  };

  // Enhanced Input Field Component
  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    keyboardType = 'default',
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon?: keyof typeof Ionicons.glyphMap;
    keyboardType?: 'default' | 'numeric';
  }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text>
      <View style={[styles.input, { backgroundColor: theme.surface.input, borderColor: theme.surface.secondary }, shadows.sm]}>
        {icon && <Ionicons name={icon} size={20} color={theme.comment} style={styles.inputIcon} />}
        <TextInput
          style={[styles.textInput, { color: theme.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={theme.comment}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>Profile Settings</Text>
        <Text style={[styles.pageSubtitle, { color: theme.comment }]}>Manage your account and preferences</Text>
      </View>

      {/* Theme Section */}
      <CollapsibleSection 
        title="Appearance" 
        isExpanded={showAppearance} 
        onToggle={() => setShowAppearance(!showAppearance)}
        icon="color-palette-outline"
      >
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>App Theme</Text>
          <View style={styles.themeSelector}>
            <Pressable
              style={[
                styles.themeOption,
                { backgroundColor: theme.surface.input },
                themeName === 'dracula' && [styles.themeOptionActive, { backgroundColor: theme.primary }],
                shadows.sm
              ]}
              onPress={() => setTheme('dracula')}
            >
              <Ionicons 
                name="moon" 
                size={20} 
                color={themeName === 'dracula' ? theme.text.inverse : theme.comment} 
                style={styles.themeIcon}
              />
              <Text 
                style={[
                  styles.themeText, 
                  { color: theme.foreground },
                  themeName === 'dracula' && { color: theme.text.inverse, fontWeight: typography.weights.semibold }
                ]}
              >
                Dark
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.themeOption,
                { backgroundColor: theme.surface.input },
                themeName === 'light' && [styles.themeOptionActive, { backgroundColor: theme.primary }],
                shadows.sm
              ]}
              onPress={() => setTheme('light')}
            >
              <Ionicons 
                name="sunny" 
                size={20} 
                color={themeName === 'light' ? theme.text.inverse : theme.comment}
                style={styles.themeIcon}
              />
              <Text 
                style={[
                  styles.themeText, 
                  { color: theme.foreground },
                  themeName === 'light' && { color: theme.text.inverse, fontWeight: typography.weights.semibold }
                ]}
              >
                Light
              </Text>
            </Pressable>
          </View>
        </View>
      </CollapsibleSection>

      {/* Profile Info Section */}
      <CollapsibleSection 
        title="Your Profile" 
        isExpanded={showProfileInfo} 
        onToggle={() => setShowProfileInfo(!showProfileInfo)}
        icon="person-outline"
      >
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Birthdate</Text>
          <Pressable 
            onPress={() => setDatePickerVisibility(true)} 
            style={[styles.input, { backgroundColor: theme.surface.input, borderColor: theme.surface.secondary }, shadows.sm]}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.comment} style={styles.inputIcon} />
            <Text style={[styles.inputText, { color: birthdate ? theme.foreground : theme.comment }]}>
              {birthdate ? birthdate : 'Select your birthdate'}
            </Text>
          </Pressable>
          <DatePickerModal
            isVisible={isDatePickerVisible}
            onClose={() => setDatePickerVisibility(false)}
            onSelectDate={(date) => setBirthdate(date.toISOString().split('T')[0])}
            currentDate={birthdate ? new Date(birthdate) : new Date()}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Gender</Text>
          <View style={styles.segmentedControl}>
            {['male', 'female'].map((g) => (
              <Pressable
                key={g}
                style={[
                  styles.segment, 
                  { backgroundColor: theme.surface.input },
                  gender === g && [styles.segmentActive, { backgroundColor: theme.primary }],
                  shadows.sm
                ]}
                onPress={() => setGender(g as 'male' | 'female')}
              >
                <Ionicons 
                  name={g === 'male' ? 'male' : 'female'} 
                  size={18} 
                  color={gender === g ? theme.text.inverse : theme.comment}
                  style={styles.segmentIcon}
                />
                <Text 
                  style={[
                    styles.segmentText, 
                    { color: theme.foreground }, 
                    gender === g && { color: theme.text.inverse, fontWeight: typography.weights.semibold }
                  ]}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, styles.inputHalf]}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Height (cm)</Text>
            <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
              <Ionicons name="resize-outline" size={20} color={theme.comment} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.foreground }]}
                placeholder="180"
                placeholderTextColor={theme.comment}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, styles.inputHalf]}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Weight (kg)</Text>
            <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
              <Ionicons name="fitness-outline" size={20} color={theme.comment} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.foreground }]}
                placeholder="75"
                placeholderTextColor={theme.comment}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Activity Level</Text>
          <View style={styles.segmentedControlWrap}>
            {Object.keys(activityLevels).map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.segmentWrap, 
                  { backgroundColor: theme.surface.input },
                  activityLevel === level && [styles.segmentActive, { backgroundColor: theme.primary }],
                  shadows.sm
                ]}
                onPress={() => setActivityLevel(level as ActivityLevel)}
              >
                <Text 
                  style={[
                    styles.segmentTextSmall, 
                    { color: theme.foreground }, 
                    activityLevel === level && { color: theme.text.inverse, fontWeight: typography.weights.semibold }
                  ]}
                >
                  {activityLevels[level as ActivityLevel]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Goal</Text>
          <View style={styles.segmentedControlWrap}>
            {Object.keys(goalTypes).map((goal) => (
              <Pressable
                key={goal}
                style={[
                  styles.segmentWrap, 
                  { backgroundColor: theme.surface.input },
                  goalType === goal && [styles.segmentActive, { backgroundColor: theme.primary }],
                  shadows.sm
                ]}
                onPress={() => setGoalType(goal as GoalType)}
              >
                <Text 
                  style={[
                    styles.segmentTextSmall, 
                    { color: theme.foreground }, 
                    goalType === goal && { color: theme.text.inverse, fontWeight: typography.weights.semibold }
                  ]}
                >
                  {goalTypes[goal as GoalType]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {(goalType === 'lose-weight' || goalType === 'gain-weight') && (
          <InputField
            label="Target Weight (kg)"
            value={targetWeight}
            onChangeText={setTargetWeight}
            placeholder="Enter your target weight"
            icon="flag-outline"
            keyboardType="numeric"
          />
        )}
      </CollapsibleSection>

      {/* Vitamin Targets Section */}
      <CollapsibleSection 
        title="Vitamin Targets" 
        isExpanded={showVitaminTargets} 
        onToggle={() => setShowVitaminTargets(!showVitaminTargets)}
        icon="leaf-outline"
      >
        {Object.entries(vitaminLabels).map(([key, label]) => (
          <InputField
            key={key}
            label={label}
            value={vitaminTargets[key as keyof VitaminFields]?.toString() || ''}
            onChangeText={(text) => setVitaminTargets({ ...vitaminTargets, [key]: parseFloat(text) || undefined })}
            placeholder={`Enter ${label.split('(')[0].trim()}`}
            icon="nutrition-outline"
            keyboardType="numeric"
          />
        ))}
      </CollapsibleSection>

      {/* Mineral Targets Section */}
      <CollapsibleSection 
        title="Mineral Targets" 
        isExpanded={showMineralTargets} 
        onToggle={() => setShowMineralTargets(!showMineralTargets)}
        icon="diamond-outline"
      >
        {Object.entries(mineralLabels).map(([key, label]) => (
          <InputField
            key={key}
            label={label}
            value={mineralTargets[key as keyof MineralFields]?.toString() || ''}
            onChangeText={(text) => setMineralTargets({ ...mineralTargets, [key]: parseFloat(text) || undefined })}
            placeholder={`Enter ${label.split('(')[0].trim()}`}
            icon="water-outline"
            keyboardType="numeric"
          />
        ))}
      </CollapsibleSection>

      {/* Action Buttons */}
      <Pressable 
        style={[styles.saveButton, { backgroundColor: theme.success }, shadows.md]} 
        onPress={handleSaveProfile}
        android_ripple={{ color: theme.surface.elevated }}
      >
        <Ionicons name="checkmark-circle-outline" size={24} color={theme.text.inverse} style={styles.buttonIcon} />
        <Text style={[styles.saveButtonText, { color: theme.text.inverse }]}>Save Profile</Text>
      </Pressable>

      <View style={[styles.dangerZone, { backgroundColor: theme.surface.card, borderColor: theme.danger }, shadows.sm]}>
        <View style={styles.dangerZoneHeader}>
          <Ionicons name="warning-outline" size={24} color={theme.danger} style={styles.dangerZoneIcon} />
          <Text style={[styles.dangerZoneTitle, { color: theme.danger }]}>Danger Zone</Text>
        </View>
        <Text style={[styles.dangerZoneDescription, { color: theme.comment }]}>
          Irreversible actions that will affect your data
        </Text>
        
        <Pressable 
          style={[styles.dangerButton, { backgroundColor: theme.background, borderColor: theme.orange }]} 
          onPress={handleResetOnboarding}
        >
          <Ionicons name="refresh-outline" size={20} color={theme.orange} style={styles.buttonIcon} />
          <Text style={[styles.dangerButtonText, { color: theme.orange }]}>Reset Onboarding</Text>
        </Pressable>

        <Pressable 
          style={[styles.dangerButton, { backgroundColor: theme.background, borderColor: theme.danger }]} 
          onPress={handleResetDatabase}
        >
          <Ionicons name="trash-outline" size={20} color={theme.danger} style={styles.buttonIcon} />
          <Text style={[styles.dangerButtonText, { color: theme.danger }]}>Reset Database</Text>
        </Pressable>
      </View>
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

const vitaminLabels: Record<string, string> = {
  vitaminA: 'Vitamin A (mcg)',
  vitaminC: 'Vitamin C (mg)',
  vitaminD: 'Vitamin D (mcg)',
  vitaminB6: 'Vitamin B6 (mg)',
  vitaminE: 'Vitamin E (mg)',
  vitaminK: 'Vitamin K (mcg)',
  thiamin: 'Thiamin (mg)',
  vitaminB12: 'Vitamin B12 (mcg)',
  riboflavin: 'Riboflavin (mg)',
  folate: 'Folate (mcg)',
  niacin: 'Niacin (mg)',
  choline: 'Choline (mg)',
  pantothenicAcid: 'Pantothenic Acid (mg)',
  biotin: 'Biotin (mcg)',
  carotenoids: 'Carotenoids (mcg)',
};

const mineralLabels: Record<string, string> = {
  calcium: 'Calcium (mg)',
  chloride: 'Chloride (mg)',
  chromium: 'Chromium (mcg)',
  copper: 'Copper (mg)',
  fluoride: 'Fluoride (mg)',
  iodine: 'Iodine (mcg)',
  iron: 'Iron (mg)',
  magnesium: 'Magnesium (mg)',
  manganese: 'Manganese (mg)',
  molybdenum: 'Molybdenum (mcg)',
  phosphorus: 'Phosphorus (mg)',
  potassium: 'Potassium (mg)',
  selenium: 'Selenium (mcg)',
  sodium: 'Sodium (mg)',
  zinc: 'Zinc (mg)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },
  
  // Section Styles
  sectionContainer: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
    minHeight: 60,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  sectionContent: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },

  // Input Styles
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 52,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },
  inputText: {
    fontSize: typography.sizes.md,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },

  // Theme Selector
  themeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 52,
  },
  themeOptionActive: {
    // Applied via inline style
  },
  themeIcon: {
    marginRight: spacing.sm,
  },
  themeText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    minHeight: 52,
  },
  segmentActive: {
    // Applied via inline style
  },
  segmentIcon: {
    marginRight: spacing.sm,
  },
  segmentText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    textAlign: 'center',
  },
  
  // Wrapped Segmented Control
  segmentedControlWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  segmentWrap: {
    flexBasis: '48%',
    flexGrow: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  segmentTextSmall: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    textAlign: 'center',
  },

  // Button Styles
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    minHeight: 56,
  },
  saveButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },

  // Danger Zone
  dangerZone: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  dangerZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dangerZoneIcon: {
    marginRight: spacing.sm,
  },
  dangerZoneTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  dangerZoneDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    marginBottom: spacing.lg,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    borderWidth: 1.5,
    minHeight: 52,
  },
  dangerButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
