import DatePickerModal from '@/components/DatePickerModal';
import { InputField } from '@/components/shared/InputField';
import { useTheme } from '@/app/contexts/ThemeContext';
import { ActivityLevel, GoalType } from '@/services/db/schema';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface ProfileInfoSectionProps {
  birthdate: string;
  gender: 'male' | 'female';
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  targetWeight: string;
  onBirthdateChange: (date: string) => void;
  onGenderChange: (gender: 'male' | 'female') => void;
  onHeightChange: (height: string) => void;
  onWeightChange: (weight: string) => void;
  onActivityLevelChange: (level: ActivityLevel) => void;
  onGoalTypeChange: (goal: GoalType) => void;
  onTargetWeightChange: (weight: string) => void;
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

export function ProfileInfoSection({
  birthdate,
  gender,
  height,
  weight,
  activityLevel,
  goalType,
  targetWeight,
  onBirthdateChange,
  onGenderChange,
  onHeightChange,
  onWeightChange,
  onActivityLevelChange,
  onGoalTypeChange,
  onTargetWeightChange,
}: ProfileInfoSectionProps) {
  const { theme } = useTheme();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  return (
    <>
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
          onSelectDate={(date) => onBirthdateChange(date.toISOString().split('T')[0])}
          currentDate={birthdate ? new Date(birthdate) : new Date()}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text.secondary }]}>Gender</Text>
        <View style={styles.segmentedControl}>
          {(['male', 'female'] as const).map((g) => (
            <Pressable
              key={g}
              style={[
                styles.segment, 
                { backgroundColor: theme.surface.input },
                gender === g && [styles.segmentActive, { backgroundColor: theme.primary }],
                shadows.sm
              ]}
              onPress={() => onGenderChange(g)}
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
              onChangeText={onHeightChange}
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
              onChangeText={onWeightChange}
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
              onPress={() => onActivityLevelChange(level as ActivityLevel)}
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
              onPress={() => onGoalTypeChange(goal as GoalType)}
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
          onChangeText={onTargetWeightChange}
          placeholder="Enter your target weight"
          icon="flag-outline"
          keyboardType="numeric"
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
  inputText: {
    fontSize: typography.sizes.md,
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
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
  segmentActive: {},
  segmentIcon: {
    marginRight: spacing.sm,
  },
  segmentText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    textAlign: 'center',
  },
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
});
