import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import { InputField } from '@/components/shared/InputField';
import { DangerZone } from '@/components/profile/DangerZone';
import { NotificationSection } from '@/components/profile/NotificationSection';
import { ProfileInfoSection } from '@/components/profile/ProfileInfoSection';
import { ThemeSection } from '@/components/profile/ThemeSection';
import { TimePickerModal } from '@/components/profile/TimePickerModal';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useProfileForm } from '@/hooks/useProfileForm';
import { resetDatabase } from '@/services/db';
import { setOnboardingCompleted } from '@/services/onboardingService';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import { MineralFields, VitaminFields } from '@/types/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  
  const {
    birthdate,
    gender,
    height,
    weight,
    activityLevel,
    goalType,
    targetWeight,
    setBirthdate,
    setGender,
    setHeight,
    setWeight,
    setActivityLevel,
    setGoalType,
    setTargetWeight,
    handleSaveProfile,
  } = useProfileForm();

  const {
    notificationSettings,
    showTimePicker,
    selectedHour,
    selectedMinute,
    setSelectedHour,
    setSelectedMinute,
    setShowTimePicker,
    handleToggleNotification,
    openTimePicker,
    handleTimeSave,
    handleTestNotification,
  } = useNotificationSettings();

  const [vitaminTargets, setVitaminTargets] = useState<VitaminFields>({});
  const [mineralTargets, setMineralTargets] = useState<MineralFields>({});
  const [showVitaminTargets, setShowVitaminTargets] = useState(false);
  const [showMineralTargets, setShowMineralTargets] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);



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
        <ThemeSection />
      </CollapsibleSection>

      {/* Notifications Section */}
      <CollapsibleSection 
        title="Notifications" 
        isExpanded={showNotifications} 
        onToggle={() => setShowNotifications(!showNotifications)}
        icon="notifications-outline"
      >
        <NotificationSection
          notificationSettings={notificationSettings}
          onToggleNotification={handleToggleNotification}
          onOpenTimePicker={openTimePicker}
          onTestNotification={handleTestNotification}
        />
      </CollapsibleSection>

      {/* Profile Info Section */}
      <CollapsibleSection 
        title="Your Profile" 
        isExpanded={showProfileInfo} 
        onToggle={() => setShowProfileInfo(!showProfileInfo)}
        icon="person-outline"
      >
        <ProfileInfoSection
          birthdate={birthdate}
          gender={gender}
          height={height}
          weight={weight}
          activityLevel={activityLevel}
          goalType={goalType}
          targetWeight={targetWeight}
          onBirthdateChange={setBirthdate}
          onGenderChange={setGender}
          onHeightChange={setHeight}
          onWeightChange={setWeight}
          onActivityLevelChange={setActivityLevel}
          onGoalTypeChange={setGoalType}
          onTargetWeightChange={setTargetWeight}
        />
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

      <DangerZone
        onResetOnboarding={handleResetOnboarding}
        onResetDatabase={handleResetDatabase}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={showTimePicker !== null}
        title={showTimePicker ? `Set ${showTimePicker.charAt(0).toUpperCase() + showTimePicker.slice(1)} Time` : ''}
        hour={selectedHour}
        minute={selectedMinute}
        onHourChange={setSelectedHour}
        onMinuteChange={setSelectedMinute}
        onSave={handleTimeSave}
        onCancel={() => setShowTimePicker(null)}
      />
    </ScrollView>
  );
}



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
});
