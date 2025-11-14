import { useSnackbar } from '@/app/components/SnackbarProvider'; // Import useSnackbar
import { addWorkoutTemplate, addWorkoutTemplateExercise, getExerciseTemplates } from '@/services/database';
import { borderRadius, draculaTheme, spacing, typography } from '@/styles/theme';
import { ExerciseTemplate, SetTarget } from '@/types/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OrderedExercise extends ExerciseTemplate {
  setTargets: SetTarget[];
}

export default function CreateWorkoutTemplateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showSnackbar } = useSnackbar(); // Use the snackbar hook
  const [step, setStep] = useState(1);
  const [allExercises, setAllExercises] = useState<ExerciseTemplate[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(new Set());
  const [orderedExercises, setOrderedExercises] = useState<OrderedExercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    const exercises = getExerciseTemplates();
    setAllExercises(exercises);
  }, []);

  const toggleExerciseSelection = (id: string) => {
    const newSelectedIds = new Set(selectedExerciseIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedExerciseIds(newSelectedIds);
  };

  const handleNextStep = () => {
    const selected: OrderedExercise[] = allExercises
      .filter(ex => selectedExerciseIds.has(ex.id))
      .map(ex => ({
        ...ex,
        setTargets: ex.defaultSetTargets.map(target => ({ ...target })) // Deep copy default targets
      }));
    setOrderedExercises(selected);
    setStep(2);
  };

  const handleFinish = () => {
    if (!templateName) {
      showSnackbar('Please enter a name for the template.', 3000); // Use snackbar for error
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName,
    };
    addWorkoutTemplate(newTemplate);

    orderedExercises.forEach((exercise, index) => {
      addWorkoutTemplateExercise({
        id: Date.now().toString() + index,
        workoutTemplateId: newTemplate.id,
        exerciseTemplateId: exercise.id,
        setTargets: exercise.setTargets,
        order: index,
      });
    });

    showSnackbar('Workout template created successfully!', 3000); // Show success snackbar
    router.back();
  };

  const filteredExercises = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOrderedItem = ({ item, drag, isActive }: RenderItemParams<OrderedExercise>) => {
    return (
      <View style={[styles.orderedExerciseItem, { backgroundColor: isActive ? draculaTheme.surface.secondary : draculaTheme.surface.card }]}>
        <View style={styles.orderedExerciseHeader}>
          <Text style={styles.exerciseText}>{item.name}</Text>
          <TouchableOpacity onLongPress={drag}>
            <Ionicons name="menu" size={24} color={draculaTheme.comment} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  if (step === 1) {
    return (
      <View style={[styles.container, { paddingTop: insets.top * 2 }]}>
        <Text style={styles.header}>Select Exercises</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={draculaTheme.comment}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.exerciseItem, selectedExerciseIds.has(item.id) && styles.selectedExercise]}
              onPress={() => toggleExerciseSelection(item.id)}
            >
              <Text style={styles.exerciseText}>{item.name}</Text>
              {selectedExerciseIds.has(item.id) && <Ionicons name="checkmark-circle" size={24} color={draculaTheme.green} />}
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={[styles.button, selectedExerciseIds.size === 0 && styles.disabledButton]}
          disabled={selectedExerciseIds.size === 0}
          onPress={handleNextStep}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top / 2 }]}>
      <Text style={styles.header}>Order Exercises</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Template Name"
        placeholderTextColor={draculaTheme.comment}
        value={templateName}
        onChangeText={setTemplateName}
      />
      {/* @ts-ignore */}
      <DraggableFlatList
        containerStyle={{ flex: 1 }}
        data={orderedExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderedItem}
        onDragEnd={({ data }) => setOrderedExercises(data)}
        // @ts-ignore
        longPressDelay={200}
      />
      <TouchableOpacity style={styles.button} onPress={() => setStep(1)}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, !templateName && styles.disabledButton]} onPress={handleFinish} disabled={!templateName}>
        <Text style={styles.buttonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  header: {
    fontSize: typography.sizes.heading,
    color: draculaTheme.foreground,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  exerciseItem: {
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedExercise: {
    backgroundColor: draculaTheme.surface.secondary,
    borderColor: draculaTheme.cyan,
    borderWidth: 1,
  },
  exerciseText: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
  },
  button: {
    backgroundColor: draculaTheme.cyan,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  disabledButton: {
    backgroundColor: draculaTheme.comment,
  },
  buttonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  orderedExerciseItem: {
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  orderedExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
});
