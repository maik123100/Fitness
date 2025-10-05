import { useState, useEffect } from 'react';
import { Alert, Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getExerciseTemplates, addExerciseTemplate, deleteExerciseTemplate, updateExerciseTemplate, ExerciseTemplate } from '../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../styles/theme';
import { Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { useRouter } from "expo-router";

export default function manageExerciseTemplates() {
  const router = useRouter();

  const insets = useSafeAreaInsets();

  const [exerciseTemplates, setExerciseTemplates] = useState<ExerciseTemplate[]>([]);
  const [newExerciseTemplateName, setNewExerciseTemplateName] = useState('');
  const [newExerciseTemplateSets, setNewExerciseTemplateSets] = useState('3');
  const [newExerciseTemplateReps, setNewExerciseTemplateReps] = useState('8-12');
  const [editingTemplate, setEditingTemplate] = useState<ExerciseTemplate | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedSets, setEditedSets] = useState('');
  const [editedReps, setEditedReps] = useState('');

  useEffect(() => {
    loadExerciseTemplates();
  }, []);

  const loadExerciseTemplates = () => {
    const data = getExerciseTemplates();
    setExerciseTemplates(data);
  };

  const handleAddExerciseTemplate = () => {
    if (!newExerciseTemplateName) {
      Alert.alert('Error', 'Please enter a template name.');
      return;
    }

    addExerciseTemplate({
      id: Date.now().toString(),
      name: newExerciseTemplateName,
      default_sets: parseInt(newExerciseTemplateSets),
      default_reps: newExerciseTemplateReps,
    });
    setNewExerciseTemplateName('');
    setNewExerciseTemplateSets('3');
    setNewExerciseTemplateReps('8-12');
    loadExerciseTemplates();
  };

  const handleEditPress = (template: ExerciseTemplate) => {
    setEditingTemplate(template);
    setEditedName(template.name);
    setEditedSets(template.default_sets.toString());
    setEditedReps(template.default_reps);
    setEditModalVisible(true);
  };

  const handleUpdateExerciseTemplate = () => {
    if (!editingTemplate || !editedName) {
      Alert.alert('Error', 'Please enter a template name.');
      return;
    }

    updateExerciseTemplate({
      ...editingTemplate,
      name: editedName,
      default_sets: parseInt(editedSets),
      default_reps: editedReps,
    });
    setEditModalVisible(false);
    setEditingTemplate(null);
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Add New Exercise Template</Text>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.back()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Exercise Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter exercise name"
        placeholderTextColor={draculaTheme.comment}
        value={newExerciseTemplateName}
        onChangeText={setNewExerciseTemplateName}
      />
      <Text style={styles.label}>Default Sets</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter default sets"
        placeholderTextColor={draculaTheme.comment}
        keyboardType="numeric"
        value={newExerciseTemplateSets}
        onChangeText={setNewExerciseTemplateSets}
      />
      <Text style={styles.label}>Default Reps</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter default reps"
        placeholderTextColor={draculaTheme.comment}
        value={newExerciseTemplateReps}
        onChangeText={setNewExerciseTemplateReps}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddExerciseTemplate}>
        <Text style={styles.addButtonText}>Add Exercise Template</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Existing Exercise Templates</Text>
      <FlatList
        data={exerciseTemplates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: ExerciseTemplate }) => (
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
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Edit Exercise Template</Text>
            <Text style={styles.label}>Exercise Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter exercise name"
              placeholderTextColor={draculaTheme.comment}
              value={editedName}
              onChangeText={setEditedName}
            />
            <Text style={styles.label}>Default Sets</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter default sets"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={editedSets}
              onChangeText={setEditedSets}
            />
            <Text style={styles.label}>Default Reps</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter default reps"
              placeholderTextColor={draculaTheme.comment}
              value={editedReps}
              onChangeText={setEditedReps}
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={handleUpdateExerciseTemplate}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={() => setEditModalVisible(false)}>
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
