import { useState, useEffect } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getExerciseTemplates, addExerciseTemplate, deleteExerciseTemplate, updateExerciseTemplate } from '@/services/database';
import { ExerciseTemplate } from '@/types/types';
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

interface ManageExerciseTemplatesState {
  exerciseTemplates: ExerciseTemplate[];
  newTemplateForm: {
    name: string;
    sets: string;
    reps: string;
  };
  editModal: {
    visible: boolean;
    template: ExerciseTemplate | null;
    name: string;
    sets: string;
    reps: string;
  };
}

export default function ManageExerciseTemplates() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [state, setState] = useState<ManageExerciseTemplatesState>({
    exerciseTemplates: [],
    newTemplateForm: { name: '', sets: '3', reps: '8-12' },
    editModal: { visible: false, template: null, name: '', sets: '', reps: '' },
  });

  const { exerciseTemplates, newTemplateForm, editModal } = state;

  useEffect(() => {
    loadExerciseTemplates();
  }, []);

  const loadExerciseTemplates = () => {
    const data = getExerciseTemplates();
    setState(prev => ({ ...prev, exerciseTemplates: data }));
  };

  const handleAddExerciseTemplate = () => {
    if (!newTemplateForm.name) {
      Alert.alert('Error', 'Please enter a template name.');
      return;
    }

    addExerciseTemplate({
      id: Date.now().toString(),
      name: newTemplateForm.name,
      default_sets: parseInt(newTemplateForm.sets),
      default_reps: newTemplateForm.reps,
    });
    setState(prev => ({ ...prev, newTemplateForm: { name: '', sets: '3', reps: '8-12' } }));
    loadExerciseTemplates();
  };

  const handleEditPress = (template: ExerciseTemplate) => {
    setState(prev => ({
      ...prev,
      editModal: {
        visible: true,
        template: template,
        name: template.name,
        sets: template.default_sets.toString(),
        reps: template.default_reps,
      },
    }));
  };

  const handleUpdateExerciseTemplate = () => {
    if (!editModal.template || !editModal.name) {
      Alert.alert('Error', 'Please enter a template name.');
      return;
    }

    updateExerciseTemplate({
      ...editModal.template,
      name: editModal.name,
      default_sets: parseInt(editModal.sets),
      default_reps: editModal.reps,
    });
    setState(prev => ({ ...prev, editModal: { visible: false, template: null, name: '', sets: '', reps: '' } }));
    loadExerciseTemplates();
  };

  const handleDeleteExerciseTemplate = (id: string) => {
    Alert.alert('Delete Template', 'Are you sure you want to delete this exercise template?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          deleteExerciseTemplate(id);
          loadExerciseTemplates();
        }
      },
    ]);
  };

  const handleFormChange = (field: keyof ManageExerciseTemplatesState['newTemplateForm'], value: string) => {
    setState(prev => ({ ...prev, newTemplateForm: { ...prev.newTemplateForm, [field]: value } }));
  };

  const handleEditModalChange = (field: keyof ManageExerciseTemplatesState['editModal'], value: string) => {
    setState(prev => ({ ...prev, editModal: { ...prev.editModal, [field]: value } }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Add New Exercise Template</Text>
        <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Exercise Name</Text>
      <TextInput style={styles.input} placeholder="Enter exercise name" placeholderTextColor={draculaTheme.comment} value={newTemplateForm.name} onChangeText={(text) => handleFormChange('name', text)} />
      <Text style={styles.label}>Default Sets</Text>
      <TextInput style={styles.input} placeholder="Enter default sets" placeholderTextColor={draculaTheme.comment} keyboardType="numeric" value={newTemplateForm.sets} onChangeText={(text) => handleFormChange('sets', text)} />
      <Text style={styles.label}>Default Reps</Text>
      <TextInput style={styles.input} placeholder="Enter default reps" placeholderTextColor={draculaTheme.comment} value={newTemplateForm.reps} onChangeText={(text) => handleFormChange('reps', text)} />
      <TouchableOpacity style={styles.addButton} onPress={handleAddExerciseTemplate}>
        <Text style={styles.addButtonText}>Add Exercise Template</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Existing Exercise Templates</Text>
      <FlatList
        data={exerciseTemplates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.exerciseItem}>
            <Text style={styles.exerciseText}>{item.name} ({item.default_sets}x{item.default_reps})</Text>
            <TouchableOpacity onPress={() => handleDeleteExerciseTemplate(item.id)}>
              <Ionicons name="trash" size={24} color={draculaTheme.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModal.visible}
        onRequestClose={() => setState(prev => ({ ...prev, editModal: { ...prev.editModal, visible: false } }))}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Edit Exercise Template</Text>
            <Text style={styles.label}>Exercise Name</Text>
            <TextInput style={styles.input} placeholder="Enter exercise name" placeholderTextColor={draculaTheme.comment} value={editModal.name} onChangeText={(text) => handleEditModalChange('name', text)} />
            <Text style={styles.label}>Default Sets</Text>
            <TextInput style={styles.input} placeholder="Enter default sets" placeholderTextColor={draculaTheme.comment} keyboardType="numeric" value={editModal.sets} onChangeText={(text) => handleEditModalChange('sets', text)} />
            <Text style={styles.label}>Default Reps</Text>
            <TextInput style={styles.input} placeholder="Enter default reps" placeholderTextColor={draculaTheme.comment} value={editModal.reps} onChangeText={(text) => handleEditModalChange('reps', text)} />
            <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleUpdateExerciseTemplate}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={() => setState(prev => ({ ...prev, editModal: { ...prev.editModal, visible: false } }))}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  doneButton: {
    backgroundColor: draculaTheme.green,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  doneButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
  addButton: {
    backgroundColor: draculaTheme.cyan,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  exerciseItem: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseText: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: draculaTheme.foreground,
    fontSize: typography.sizes.lg,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    width: 150,
    alignItems: 'center',
  },
  buttonSave: {
    backgroundColor: draculaTheme.green,
  },
  buttonCancel: {
    backgroundColor: draculaTheme.red,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});