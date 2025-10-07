import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getWorkoutTemplates, getActiveWorkoutSession, startWorkoutSession, addWorkoutTemplate, addWorkoutTemplateExercise, getExerciseTemplates, WorkoutTemplate, ActiveWorkoutSession, ExerciseTemplate, WorkoutTemplateExercise } from '../../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../../styles/theme';
import { useRouter } from 'expo-router';

interface TrainingState {
  templates: WorkoutTemplate[];
  activeSession: ActiveWorkoutSession | null;
  exerciseTemplates: ExerciseTemplate[];
  modal: {
    visible: boolean;
    newTemplateName: string;
    newExercises: (WorkoutTemplateExercise & { exercise_name: string })[];
    selectedExerciseTemplateId: string | null;
  };
}

export default function WorkoutScreen() {
  const router = useRouter();
  const [state, setState] = useState<TrainingState>({
    templates: [],
    activeSession: null,
    exerciseTemplates: [],
    modal: {
      visible: false,
      newTemplateName: '',
      newExercises: [],
      selectedExerciseTemplateId: null,
    },
  });

  const { templates, activeSession, exerciseTemplates, modal } = state;

  useEffect(() => {
    loadData();
    loadExerciseTemplates();
  }, []);

  const loadData = () => {
    const templatesData = getWorkoutTemplates();
    const activeSessionData = getActiveWorkoutSession();
    setState(prev => ({ ...prev, templates: templatesData, activeSession: activeSessionData }));
  };

  const loadExerciseTemplates = () => {
    const data = getExerciseTemplates();
    setState(prev => ({ ...prev, exerciseTemplates: data }));
  };

  const handleCreateTemplate = () => {
    const newTemplate = { id: Date.now().toString(), name: modal.newTemplateName };
    addWorkoutTemplate(newTemplate);
    modal.newExercises.forEach(ex => {
      addWorkoutTemplateExercise({
        id: ex.id,
        workout_template_id: newTemplate.id,
        exercise_template_id: ex.exercise_template_id,
        sets: ex.sets,
        reps: ex.reps,
      });
    });
    setState(prev => ({ ...prev, modal: { ...prev.modal, visible: false, newTemplateName: '', newExercises: [] } }));
    loadData();
  };

  const addExerciseToTemplate = () => {
    if (!modal.selectedExerciseTemplateId) {
      Alert.alert('Error', 'Please select an exercise template.');
      return;
    }
    const selectedTemplate = exerciseTemplates.find(t => t.id === modal.selectedExerciseTemplateId);
    if (selectedTemplate) {
      const newExercise: WorkoutTemplateExercise & { exercise_name: string } = {
        id: Date.now().toString(),
        workout_template_id: '', // This will be set when the template is created
        exercise_template_id: selectedTemplate.id,
        sets: selectedTemplate.default_sets,
        reps: selectedTemplate.default_reps,
        exercise_name: selectedTemplate.name,
      };
      setState(prev => ({
        ...prev,
        modal: {
          ...prev.modal,
          newExercises: [...prev.modal.newExercises, newExercise],
          selectedExerciseTemplateId: null,
        },
      }));
    }
  };

  const handleSelectExerciseTemplate = (templateId: string | null) => {
    setState(prev => ({ ...prev, modal: { ...prev.modal, selectedExerciseTemplateId: templateId } }));
  };

  const handleTemplatePress = (templateId: string) => {
    if (activeSession && activeSession.workout_template_id !== templateId) {
      // Ask user to discard active session
    } else if (activeSession && activeSession.workout_template_id === templateId) {
      router.push('/workoutSession');
    } else {
      startWorkoutSession(templateId);
      router.push('/workoutSession');
    }
  };

  return (
    <View style={styles.container}>
      {activeSession && (
        <TouchableOpacity onPress={() => router.push('/workoutSession')}>
          <View style={styles.activeSessionCard}>
            <Text style={styles.activeSessionTitle}>Active Workout</Text>
          </View>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Workout Templates</Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleTemplatePress(item.id)}>
            <View style={styles.templateCard}>
              <Text style={styles.templateTitle}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.createButton} onPress={() => setState(prev => ({ ...prev, modal: { ...prev.modal, visible: true } }))}>
        <Text style={styles.createButtonText}>Create New Workout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.createButton} onPress={() => router.push('/manageExerciseTemplates')}>
        <Text style={styles.createButtonText}>Manage Exercise Templates</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modal.visible}
        onRequestClose={() => {
          setState(prev => ({ ...prev, modal: { ...prev.modal, visible: false } }));
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <FlatList
              data={modal.newExercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <Text style={styles.exerciseText}>{item.exercise_name} {item.sets}x{item.reps}</Text>}
              ListHeaderComponent={
                <View>
                  <Text style={styles.modalText}>Create New Workout Template</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Template Name"
                    placeholderTextColor={draculaTheme.comment}
                    value={modal.newTemplateName}
                    onChangeText={(text) => setState(prev => ({ ...prev, modal: { ...prev.modal, newTemplateName: text } }))}
                  />
                  <View style={styles.addExerciseContainer}>
                    <Picker
                      selectedValue={modal.selectedExerciseTemplateId}
                      style={styles.picker}
                      onValueChange={(itemValue) => handleSelectExerciseTemplate(itemValue)}>
                      <Picker.Item label="-- Select an Exercise Template --" value={null} />
                      {exerciseTemplates.map(template => (
                        <Picker.Item key={template.id} label={`${template.name} (${template.default_sets}x${template.default_reps})`} value={template.id} />
                      ))}
                    </Picker>
                    <TouchableOpacity style={styles.addButton} onPress={addExerciseToTemplate}>
                      <Text style={styles.textStyle}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
              ListFooterComponent={
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={handleCreateTemplate}>
                  <Text style={styles.textStyle}>Save Template</Text>
                </TouchableOpacity>
              }
            />
          </View>
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
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
  },
  activeSessionCard: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: draculaTheme.cyan,
  },
  activeSessionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
  },
  templateCard: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  templateTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
  },
  createButton: {
    backgroundColor: draculaTheme.cyan,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  createButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: draculaTheme.surface.card,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: draculaTheme.foreground,
    fontSize: typography.sizes.lg,
  },
  input: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
    width: 200,
  },
  addExerciseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  picker: {
    flex: 1,
    height: 50,
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    borderRadius: borderRadius.md,
  },
  addButton: {
    backgroundColor: draculaTheme.cyan,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  exerciseText: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
});