
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getWorkoutTemplates, getActiveWorkoutSession, startWorkoutSession, addWorkoutTemplate, addWorkoutTemplateExercise, getExerciseTemplates, addExerciseTemplate } from '../../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../../styles/theme';
import { useRouter } from 'expo-router';

export default function WorkoutScreen() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newExercises, setNewExercises] = useState<any[]>([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('3');
  const [newExerciseReps, setNewExerciseReps] = useState('8-12');
  const [exerciseTemplates, setExerciseTemplates] = useState<any[]>([]);



  const [selectedExerciseTemplateId, setSelectedExerciseTemplateId] = useState<string | null>(null);

  const loadData = () => {
    const templatesData = getWorkoutTemplates();
    const activeSessionData = getActiveWorkoutSession();
    setTemplates(templatesData);
    setActiveSession(activeSessionData);
  };

  const loadExerciseTemplates = () => {
    const data = getExerciseTemplates();
    setExerciseTemplates(data);
  };

  useEffect(() => {
    loadData();
    loadExerciseTemplates();
  }, []);



  const handleCreateTemplate = () => {
    const newTemplate = { id: Date.now().toString(), name: newTemplateName };
    addWorkoutTemplate(newTemplate);
    newExercises.forEach(ex => {
      addWorkoutTemplateExercise({
        id: ex.id,
        workout_template_id: newTemplate.id,
        exercise_template_id: ex.exercise_template_id,
        sets: ex.sets,
        reps: ex.reps,
      });
    });
    setModalVisible(false);
    loadData();
  };

  const addExerciseToTemplate = () => {
    if (!selectedExerciseTemplateId) {
      Alert.alert('Error', 'Please select an exercise template.');
      return;
    }
    const selectedTemplate = exerciseTemplates.find(t => t.id === selectedExerciseTemplateId);
    if (selectedTemplate) {
      setNewExercises([...newExercises, {
        id: Date.now().toString(),
        exercise_template_id: selectedTemplate.id,
        sets: parseInt(newExerciseSets),
        reps: newExerciseReps,
        exercise_name: selectedTemplate.name,
      }]);
      setSelectedExerciseTemplateId(null);
      setNewExerciseName('');
      setNewExerciseSets('3');
      setNewExerciseReps('8-12');
    }
  };



  const handleSelectExerciseTemplate = (templateId: string | null) => {
    if (!templateId) {
      setSelectedExerciseTemplateId(null);
      setNewExerciseName('');
      setNewExerciseSets('3');
      setNewExerciseReps('8-12');
      return;
    }
    setSelectedExerciseTemplateId(templateId);
    const selectedTemplate = exerciseTemplates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setNewExerciseName(selectedTemplate.name);
      setNewExerciseSets(selectedTemplate.default_sets.toString());
      setNewExerciseReps(selectedTemplate.default_reps);
    }
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
            {/* Add more details about the active session */}
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

      <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.createButtonText}>Create New Workout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.createButton} onPress={() => router.push('/manageExerciseTemplates')}>
        <Text style={styles.createButtonText}>Manage Exercise Templates</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <FlatList
              data={newExercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <Text style={styles.exerciseText}>{item.exercise_name} {item.default_sets}x{item.default_reps}</Text>}
              ListHeaderComponent={
                <View>
                  <Text style={styles.modalText}>Create New Workout Template</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Template Name"
                    placeholderTextColor={draculaTheme.comment}
                    value={newTemplateName}
                    onChangeText={setNewTemplateName}
                  />
                  <View style={styles.addExerciseContainer}>
                    <Picker
                      selectedValue={selectedExerciseTemplateId}
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
