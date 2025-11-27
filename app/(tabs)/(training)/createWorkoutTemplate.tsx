import { useTheme } from '@/app/contexts/ThemeContext';
import { useSnackbar } from '@/app/components/SnackbarProvider'; // Import useSnackbar
import { addWorkoutTemplate, addWorkoutTemplateExercise, getExerciseTemplates } from '@/services/database';
import { borderRadius, spacing, typography } from '@/styles/theme';
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
  const { theme } = useTheme();
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
      <View style={[styles.orderedExerciseItem, { backgroundColor: isActive ? theme.surface.secondary : theme.surface.card }]}>
        <View style={styles.orderedExerciseHeader}>
          <Text style={[styles.exerciseText, { color: theme.foreground }]}>{item.name}</Text>
          <TouchableOpacity onLongPress={drag}>
            <Ionicons name="menu" size={24} color={theme.comment} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  if (step === 1) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top * 2 }]}>
        <Text style={[styles.header, { color: theme.foreground }]}>Select Exercises</Text>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.surface.input, color: theme.foreground }]}
          placeholder="Search exercises..."
          placeholderTextColor={theme.comment}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.exerciseItem, { backgroundColor: theme.surface.card }, selectedExerciseIds.has(item.id) && { backgroundColor: theme.surface.secondary, borderColor: theme.cyan }]}
              onPress={() => toggleExerciseSelection(item.id)}
            >
              <Text style={[styles.exerciseText, { color: theme.foreground }]}>{item.name}</Text>
              {selectedExerciseIds.has(item.id) && <Ionicons name="checkmark-circle" size={24} color={theme.green} />}
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.cyan }, selectedExerciseIds.size === 0 && { backgroundColor: theme.comment }]}
          disabled={selectedExerciseIds.size === 0}
          onPress={handleNextStep}
        >
          <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top / 2 }]}>
      <Text style={[styles.header, { color: theme.foreground }]}>Order Exercises</Text>
      <TextInput
        style={[styles.searchInput, { backgroundColor: theme.surface.input, color: theme.foreground }]}
        placeholder="Template Name"
        placeholderTextColor={theme.comment}
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
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.cyan }]} onPress={() => setStep(1)}>
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.cyan }, !templateName && { backgroundColor: theme.comment }]} onPress={handleFinish} disabled={!templateName}>
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    fontSize: typography.sizes.heading,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  searchInput: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  exerciseItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseText: {
    fontSize: typography.sizes.md,
  },
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  orderedExerciseItem: {
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
