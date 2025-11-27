import { useTheme } from '@/app/contexts/ThemeContext';
import SetTargetInputList from '@/app/components/SetTargetInputList';
import { addExerciseTemplate, deleteExerciseTemplate, getExerciseTemplates, updateExerciseTemplate } from '@/services/database';
import { borderRadius, spacing, typography } from '@/styles/theme';
import { ExerciseTemplate, SetTarget } from '@/types/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ManageExerciseTemplatesState {
  exerciseTemplates: ExerciseTemplate[];
  newTemplateForm: {
    name: string;
    defaultSetTargets: SetTarget[];
  };
  editModal: {
    visible: boolean;
    template: ExerciseTemplate | null;
    name: string;
    defaultSetTargets: SetTarget[];
  };
}

interface ListHeaderProps {
  newTemplateForm: ManageExerciseTemplatesState['newTemplateForm'];
  handleFormChange: (field: keyof ManageExerciseTemplatesState['newTemplateForm'], value: string | SetTarget[]) => void;
  handleAddExerciseTemplate: () => void;
  router: ReturnType<typeof useRouter>;
  theme: any;
  styles: {
    headerContainer: object;
    sectionTitle: object;
    doneButton: object;
    doneButtonText: object;
    label: object;
    input: object;
    exerciseNameInput: object;
    addButton: object;
    addButtonText: object;
  };
}

const ListHeader = memo(({
  newTemplateForm,
  handleFormChange,
  handleAddExerciseTemplate,
  router,
  theme,
  styles,
}: ListHeaderProps) => {
  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Add New Exercise Template</Text>
        <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Exercise Name</Text>
      <TextInput style={[styles.input, styles.exerciseNameInput, { backgroundColor: theme.surface.input, color: theme.foreground }]} placeholder="Enter exercise name" placeholderTextColor={theme.comment} value={newTemplateForm.name} onChangeText={(text) => handleFormChange('name', text)} />
      <Text style={styles.label}>Default Set Targets</Text>
      <SetTargetInputList
        setTargets={newTemplateForm.defaultSetTargets}
        onChange={(targets: SetTarget[]) => handleFormChange('defaultSetTargets', targets)}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddExerciseTemplate}>
        <Text style={styles.addButtonText}>Add Exercise Template</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Existing Exercise Templates</Text>
    </View>
  );
});

ListHeader.displayName = 'ListHeader';

export default function ManageExerciseTemplates() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [state, setState] = useState<ManageExerciseTemplatesState>({
    exerciseTemplates: [],
    newTemplateForm: { name: '', defaultSetTargets: [{ reps: 8, weight: 0 }, { reps: 10, weight: 0 }, { reps: 12, weight: 0 }] }, // Default to 3 sets with 8, 10, 12 reps and 0 weight
    editModal: { visible: false, template: null, name: '', defaultSetTargets: [] },
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
      defaultSetTargets: newTemplateForm.defaultSetTargets,
    });
    setState(prev => ({ ...prev, newTemplateForm: { name: '', defaultSetTargets: [{ reps: 8, weight: 0 }, { reps: 10, weight: 0 }, { reps: 12, weight: 0 }] } }));
    loadExerciseTemplates();
  };

  const handleEditPress = (template: ExerciseTemplate) => {
    setState(prev => ({
      ...prev,
      editModal: {
        visible: true,
        template: template,
        name: template.name,
        defaultSetTargets: template.defaultSetTargets,
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
      defaultSetTargets: editModal.defaultSetTargets,
    });
    setState(prev => ({ ...prev, editModal: { visible: false, template: null, name: '', defaultSetTargets: [] } }));
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

  const handleFormChange = useCallback((field: keyof ManageExerciseTemplatesState['newTemplateForm'], value: string | SetTarget[]) => {
    setState(prev => ({
      ...prev,
      newTemplateForm: {
        ...prev.newTemplateForm,
        [field]: value,
      },
    }));
  }, []);

  const handleEditModalChange = useCallback((field: keyof ManageExerciseTemplatesState['editModal'], value: string | SetTarget[]) => {
    setState(prev => ({
      ...prev,
      editModal: {
        ...prev.editModal,
        [field]: value,
      },
    }));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <FlatList
        data={exerciseTemplates}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <ListHeader
            newTemplateForm={newTemplateForm}
            handleFormChange={handleFormChange}
            handleAddExerciseTemplate={handleAddExerciseTemplate}
            router={router}
            theme={theme}
            styles={{
              ...styles,
              sectionTitle: [styles.sectionTitle, { color: theme.foreground }],
              doneButton: [styles.doneButton, { backgroundColor: theme.green }],
              doneButtonText: [styles.doneButtonText, { color: theme.text.inverse }],
              label: [styles.label, { color: theme.foreground }],
              addButton: [styles.addButton, { backgroundColor: theme.cyan }],
              addButtonText: [styles.addButtonText, { color: theme.text.inverse }],
              headerContainer: styles.headerContainer,
            }}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleEditPress(item)} style={[styles.exerciseItem, { backgroundColor: theme.surface.card }]}>
            <Text style={[styles.exerciseText, { color: theme.foreground }]}>{item.name} ({item.defaultSetTargets.length} sets)</Text>
            <TouchableOpacity onPress={() => handleDeleteExerciseTemplate(item.id)}>
              <Ionicons name="trash" size={24} color={theme.red} />
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
          <View style={[styles.modalView, { backgroundColor: theme.surface.card }]}>
            <Text style={[styles.modalText, { color: theme.foreground }]}>Edit Exercise Template</Text>
            <Text style={[styles.label, { color: theme.foreground }]}>Exercise Name</Text>
            <TextInput style={[styles.input, styles.exerciseNameInput, { backgroundColor: theme.surface.input, color: theme.foreground }]} placeholder="Enter exercise name" placeholderTextColor={theme.comment} value={editModal.name} onChangeText={(text) => handleEditModalChange('name', text)} />
            <Text style={[styles.label, { color: theme.foreground }]}>Default Set Targets</Text>
            <SetTargetInputList
              setTargets={editModal.defaultSetTargets}
              onChange={(targets: SetTarget[]) => handleEditModalChange('defaultSetTargets', targets)}
            />
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.green }]} onPress={handleUpdateExerciseTemplate}>
              <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.red }]} onPress={() => setState(prev => ({ ...prev, editModal: { ...prev.editModal, visible: false } }))}>
              <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Cancel</Text>
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
    padding: spacing.md,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  doneButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  doneButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  input: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  exerciseNameInput: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
  addButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  exerciseItem: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseText: {
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
