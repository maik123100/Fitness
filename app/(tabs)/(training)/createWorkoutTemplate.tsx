import { useTheme } from '@/app/contexts/ThemeContext';
import { useSnackbar } from '@/app/components/SnackbarProvider';
import { addWorkoutTemplate, addWorkoutTemplateExercise, getExerciseTemplates } from '@/services/database';
import { borderRadius, spacing, typography } from '@/styles/theme';
import { ExerciseTemplate, SetTarget } from '@/types/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
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
    if (!templateName.trim()) {
      showSnackbar('Please enter a name for the template.', 3000);
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
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

    showSnackbar('Workout template created successfully!', 3000);
    router.back();
  };

  const filteredExercises = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOrderedItem = ({ item, drag, isActive }: RenderItemParams<OrderedExercise>) => {
    return (
      <View style={[
        styles.orderedExerciseItem, 
        { 
          backgroundColor: isActive ? theme.surface.secondary : theme.surface.card,
          borderColor: isActive ? theme.cyan : 'transparent',
          borderWidth: isActive ? 2 : 0,
          elevation: isActive ? 8 : 2,
          shadowColor: theme.currentLine,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isActive ? 0.3 : 0.1,
          shadowRadius: isActive ? 8 : 4,
        }
      ]}>
        <View style={styles.orderedExerciseHeader}>
          <View style={styles.exerciseNameContainer}>
            <Ionicons name="barbell-outline" size={20} color={theme.cyan} style={{ marginRight: spacing.sm }} />
            <Text style={[styles.exerciseText, { color: theme.foreground, flex: 1 }]} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
          <TouchableOpacity 
            onLongPress={drag}
            style={[styles.dragHandle, { backgroundColor: theme.surface.secondary }]}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={20} color={theme.comment} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  if (step === 1) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header Section */}
        <View style={[styles.headerSection, { paddingTop: insets.top + spacing.xs }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.foreground} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.header, { color: theme.foreground }]}>Select Exercises</Text>
              <Text style={[styles.subtitle, { color: theme.comment }]}>
                Choose exercises for your workout
              </Text>
            </View>
          </View>
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressSteps}>
              <View style={[styles.progressStep, { backgroundColor: theme.cyan }]}>
                <Text style={[styles.progressStepText, { color: theme.text.inverse }]}>1</Text>
              </View>
              <View style={[styles.progressLine, { backgroundColor: theme.surface.secondary }]} />
              <View style={[styles.progressStep, { backgroundColor: theme.surface.secondary }]}>
                <Text style={[styles.progressStepText, { color: theme.comment }]}>2</Text>
              </View>
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: theme.cyan }]}>Select</Text>
              <Text style={[styles.progressLabel, { color: theme.comment }]}>Order</Text>
            </View>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.comment} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.surface.input, color: theme.foreground }]}
            placeholder="Search exercises..."
            placeholderTextColor={theme.comment}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={theme.comment} />
            </TouchableOpacity>
          )}
        </View>

        {/* Exercise List */}
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedExerciseIds.has(item.id);
            return (
              <TouchableOpacity
                style={[
                  styles.exerciseItem, 
                  { backgroundColor: theme.surface.card },
                  isSelected && { 
                    backgroundColor: theme.surface.secondary, 
                    borderColor: theme.cyan,
                    borderWidth: 2
                  }
                ]}
                onPress={() => toggleExerciseSelection(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseItemContent}>
                  <View style={styles.exerciseIconContainer}>
                    <Ionicons 
                      name="barbell-outline" 
                      size={24} 
                      color={isSelected ? theme.cyan : theme.comment} 
                    />
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseText, { color: theme.foreground }]}>
                      {item.name}
                    </Text>
                    {item.defaultSetTargets.length > 0 && (
                      <Text style={[styles.exerciseSubtext, { color: theme.comment }]}>
                        {item.defaultSetTargets.length} set{item.defaultSetTargets.length !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.green} />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={theme.comment} />
              <Text style={[styles.emptyText, { color: theme.comment }]}>
                {searchQuery ? 'No exercises found' : 'No exercises available'}
              </Text>
            </View>
          }
        />

        {/* Next Button */}
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity
            style={[
              styles.primaryButton, 
              { backgroundColor: selectedExerciseIds.size > 0 ? theme.cyan : theme.surface.secondary },
            ]}
            disabled={selectedExerciseIds.size === 0}
            onPress={handleNextStep}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.buttonText, 
              { color: selectedExerciseIds.size > 0 ? theme.text.inverse : theme.comment }
            ]}>
              Next
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={selectedExerciseIds.size > 0 ? theme.text.inverse : theme.comment} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Section */}
      <View style={[styles.headerSection, { paddingTop: insets.top + spacing.xs }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => setStep(1)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.foreground} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.header, { color: theme.foreground }]}>Order Exercises</Text>
            <Text style={[styles.subtitle, { color: theme.comment }]}>
              Drag to reorder exercises
            </Text>
          </View>
        </View>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressSteps}>
            <View style={[styles.progressStep, { backgroundColor: theme.green }]}>
              <Ionicons name="checkmark" size={16} color={theme.text.inverse} />
            </View>
            <View style={[styles.progressLine, { backgroundColor: theme.cyan }]} />
            <View style={[styles.progressStep, { backgroundColor: theme.cyan }]}>
              <Text style={[styles.progressStepText, { color: theme.text.inverse }]}>2</Text>
            </View>
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: theme.green }]}>Select</Text>
            <Text style={[styles.progressLabel, { color: theme.cyan }]}>Order</Text>
          </View>
        </View>
      </View>

      {/* Template Name Input */}
      <View style={styles.nameInputContainer}>
        <Text style={[styles.inputLabel, { color: theme.foreground }]}>Template Name</Text>
        <View style={styles.nameInputWrapper}>
          <Ionicons name="document-text-outline" size={20} color={theme.comment} style={styles.nameInputIcon} />
          <TextInput
            style={[styles.nameInput, { backgroundColor: theme.surface.input, color: theme.foreground }]}
            placeholder="e.g., Push Day, Full Body, etc."
            placeholderTextColor={theme.comment}
            value={templateName}
            onChangeText={setTemplateName}
          />
        </View>
      </View>

      {/* Draggable List */}
      {/* @ts-ignore */}
      <DraggableFlatList
        containerStyle={styles.draggableContainer}
        contentContainerStyle={styles.listContent}
        data={orderedExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderedItem}
        onDragEnd={({ data }) => setOrderedExercises(data)}
        // @ts-ignore
        activationDistance={10}
      />

      {/* Action Buttons */}
      <View style={[styles.actionButtonsContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity 
          style={[styles.secondaryButton, { backgroundColor: theme.surface.secondary, borderColor: theme.comment }]} 
          onPress={() => setStep(1)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={theme.foreground} />
          <Text style={[styles.secondaryButtonText, { color: theme.foreground }]}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.primaryButton, 
            { 
              backgroundColor: templateName.trim() ? theme.green : theme.surface.secondary,
              flex: 1,
              marginLeft: spacing.md
            }
          ]} 
          onPress={handleFinish} 
          disabled={!templateName.trim()}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.buttonText, 
            { color: templateName.trim() ? theme.text.inverse : theme.comment }
          ]}>
            Create Template
          </Text>
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={templateName.trim() ? theme.text.inverse : theme.comment} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  header: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: spacing.sm,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.xl + spacing.md,
    paddingRight: spacing.xl + spacing.md,
    borderRadius: borderRadius.lg,
    fontSize: typography.sizes.md,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  exerciseItem: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  exerciseItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  exerciseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  exerciseSubtext: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    marginTop: spacing.md,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + spacing.xs,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  nameInputContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  nameInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInputIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  nameInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.xl + spacing.md,
    paddingRight: spacing.md,
    borderRadius: borderRadius.lg,
    fontSize: typography.sizes.md,
  },
  draggableContainer: {
    flex: 1,
  },
  orderedExerciseItem: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  orderedExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  exerciseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  dragHandle: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
