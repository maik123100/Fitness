
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Alert, ScrollView } from 'react-native';
import {
  addWorkoutEntry,
  getWorkoutEntriesForDate,
  deleteWorkoutEntry,
  searchExercises,
  WorkoutExercise,
  WorkoutEntry,
  getUserProfile,
} from '../../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../../styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function WorkoutDiaryScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WorkoutExercise[]>([]);
  const [duration, setDuration] = useState('');

  useEffect(() => {
    loadWorkoutEntries();
  }, [date]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const results = searchExercises(searchQuery);
      setSearchResults(results);
    }
  }, [searchQuery]);

  const loadWorkoutEntries = () => {
    const entries = getWorkoutEntriesForDate(date);
    setWorkoutEntries(entries);
  };

  const handleAddWorkout = (exercise: WorkoutExercise) => {
    if (!duration) {
      Alert.alert('Error', 'Please enter the duration.');
      return;
    }

    const userProfile = getUserProfile();
    const weight = userProfile?.weight || 70; // Default to 70kg if no profile
    const caloriesBurned = (exercise.mets * 3.5 * weight) / 200 * parseInt(duration);

    const newEntry: WorkoutEntry = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      date,
      duration: parseInt(duration),
      calories: caloriesBurned,
      createdAt: Date.now(),
    };

    addWorkoutEntry(newEntry);
    setModalVisible(false);
    loadWorkoutEntries();
  };

  const handleDeleteWorkout = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this workout entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deleteWorkoutEntry(id);
        loadWorkoutEntries();
      }},
    ]);
  };

  const openSearchModal = () => {
    setSearchQuery('');
    setSearchResults([]);
    setDuration('');
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.workoutSection}>
        <Text style={styles.sectionTitle}>Today's Workouts</Text>
        {workoutEntries.map((item) => (
          <TouchableOpacity key={item.id} onLongPress={() => handleDeleteWorkout(item.id)}>
            <View style={styles.workoutITem}>
              <Text style={styles.workoutName}>{item.exerciseName}</Text>
              <View style={styles.workoutDetails}>
                <Text style={styles.workoutDuration}>{item.duration} min</Text>
                <Text style={styles.workoutCalories}>{item.calories.toFixed(0)} kcal</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={openSearchModal}>
          <Ionicons name="add" size={24} color={draculaTheme.text.inverse} />
          <Text style={styles.addButtonText}>Add Workout</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for exercise..."
            placeholderTextColor={draculaTheme.comment}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TextInput
            style={styles.durationInput}
            placeholder="Duration (in minutes)"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.searchResultItem} onPress={() => handleAddWorkout(item)}>
                <Text style={styles.searchResultName}>{item.name}</Text>
                <Text style={styles.searchResultDetails}>{item.category} - {item.muscleGroups.join(', ')}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  workoutSection: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
  },
  workoutITem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: draculaTheme.surface.secondary,
  },
  workoutName: {
    fontSize: typography.sizes.md,
    color: draculaTheme.foreground,
    flex: 1,
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutDuration: {
    fontSize: typography.sizes.md,
    color: draculaTheme.comment,
    marginRight: spacing.md,
  },
  workoutCalories: {
    fontSize: typography.sizes.md,
    color: draculaTheme.activity.cardio,
    fontWeight: typography.weights.semibold,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: draculaTheme.cyan,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  addButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  searchInput: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  durationInput: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  searchResultItem: {
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  searchResultName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
  },
  searchResultDetails: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.comment,
    marginTop: spacing.xs,
  },
});
