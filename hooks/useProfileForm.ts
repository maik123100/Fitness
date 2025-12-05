import { getUserProfile, saveUserProfile } from '@/services/database';
import { ActivityLevel, GoalType, UserProfile } from '@/services/db/schema';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useProfileForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
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
      setBirthdate(userProfile.birthdate);
      setGender(userProfile.gender as 'male' | 'female');
      setHeight(userProfile.height.toString());
      setWeight(userProfile.weight.toString());
      setActivityLevel(userProfile.activityLevel as ActivityLevel);
      setGoalType(userProfile.goalType as GoalType);
      setTargetWeight(userProfile.targetWeight?.toString() || '');
    }
  };

  const calculateCalories = () => {
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

    return targetCalories;
  };

  const handleSaveProfile = () => {
    if (!birthdate || !height || !weight) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const targetCalories = calculateCalories();

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

  return {
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
  };
}
