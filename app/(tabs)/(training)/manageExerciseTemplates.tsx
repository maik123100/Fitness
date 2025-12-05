import { useTheme } from '@/app/contexts/ThemeContext';
import SetTargetInputList from '@/components/SetTargetInputList';
import { addExerciseTemplate, deleteExerciseTemplate, getExerciseTemplates, updateExerciseTemplate } from '@/services/database';
import { borderRadius, spacing, typography } from '@/styles/theme';
import { ExerciseTemplate, SetTarget } from '@/types/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
      {/* Header with Done button */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Exercise Templates</Text>
        <TouchableOpacity 
          style={styles.doneButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={20} color={theme.text.inverse} />
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Add New Exercise Section */}
      <View style={[styles.addSection, { backgroundColor: theme.surface.card }]}>
        <View style={styles.addSectionHeader}>
          <Ionicons name="add-circle" size={24} color={theme.cyan} />
          <Text style={styles.sectionTitle}>Add New Exercise</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Exercise Name</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]} 
            placeholder="e.g., Bench Press, Squat..." 
            placeholderTextColor={theme.comment} 
            value={newTemplateForm.name} 
            onChangeText={(text) => handleFormChange('name', text)} 
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Default Set Targets</Text>
          <SetTargetInputList
            setTargets={newTemplateForm.defaultSetTargets}
            onChange={(targets: SetTarget[]) => handleFormChange('defaultSetTargets', targets)}
          />
        </View>

        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.cyan }]} 
          onPress={handleAddExerciseTemplate}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={theme.text.inverse} />
          <Text style={styles.addButtonText}>Add Template</Text>
        </TouchableOpacity>
      </View>

      {/* Existing Templates Section */}
      <View style={styles.listHeader}>
        <Ionicons name="barbell" size={20} color={theme.foreground} />
        <Text style={styles.listHeaderText}>Your Templates</Text>
      </View>
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
              listHeaderText: [styles.listHeaderText, { color: theme.foreground }],
              doneButton: [styles.doneButton, { backgroundColor: theme.green }],
              doneButtonText: [styles.doneButtonText, { color: theme.text.inverse }],
              label: [styles.label, { color: theme.foreground }],
              addButton: [styles.addButton, { backgroundColor: theme.cyan }],
              addButtonText: [styles.addButtonText, { color: theme.text.inverse }],
              headerContainer: styles.headerContainer,
              headerTitle: [styles.headerTitle, { color: theme.foreground }],
              addSection: styles.addSection,
              addSectionHeader: styles.addSectionHeader,
              formGroup: styles.formGroup,
              listHeader: styles.listHeader,
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={64} color={theme.comment} />
            <Text style={[styles.emptyText, { color: theme.comment }]}>No exercise templates yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.comment }]}>Add your first template above</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => handleEditPress(item)} 
            style={[styles.exerciseItem, { backgroundColor: theme.surface.card }]}
            activeOpacity={0.7}
          >
            <View style={styles.exerciseItemContent}>
              <View style={styles.exerciseItemLeft}>
                <Ionicons name="barbell" size={24} color={theme.cyan} />
                <View style={styles.exerciseTextContainer}>
                  <Text style={[styles.exerciseName, { color: theme.foreground }]}>{item.name}</Text>
                  <Text style={[styles.exerciseDetails, { color: theme.comment }]}>
                    {item.defaultSetTargets.length} {item.defaultSetTargets.length === 1 ? 'set' : 'sets'}
                  </Text>
                </View>
              </View>
              <View style={styles.exerciseItemActions}>
                <TouchableOpacity 
                  onPress={() => handleEditPress(item)}
                  style={[styles.actionButton, { backgroundColor: theme.surface.input }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil" size={18} color={theme.cyan} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDeleteExerciseTemplate(item.id)}
                  style={[styles.actionButton, { backgroundColor: theme.surface.input }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash" size={18} color={theme.red} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModal.visible}
        onRequestClose={() => setState(prev => ({ ...prev, editModal: { ...prev.editModal, visible: false } }))}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="create" size={24} color={theme.cyan} />
                <Text style={[styles.modalTitle, { color: theme.foreground }]}>Edit Template</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setState(prev => ({ ...prev, editModal: { ...prev.editModal, visible: false } }))}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={theme.comment} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.foreground }]}>Exercise Name</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]} 
                  placeholder="Enter exercise name" 
                  placeholderTextColor={theme.comment} 
                  value={editModal.name} 
                  onChangeText={(text) => handleEditModalChange('name', text)} 
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.foreground }]}>Default Set Targets</Text>
                <SetTargetInputList
                  setTargets={editModal.defaultSetTargets}
                  onChange={(targets: SetTarget[]) => handleEditModalChange('defaultSetTargets', targets)}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.surface.input }]} 
                onPress={() => setState(prev => ({ ...prev, editModal: { ...prev.editModal, visible: false } }))}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: theme.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.green }]} 
                onPress={handleUpdateExerciseTemplate}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark" size={20} color={theme.text.inverse} />
                <Text style={[styles.modalButtonText, { color: theme.text.inverse }]}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  doneButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  addSection: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  addSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  listHeaderText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseItem: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exerciseItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  exerciseTextContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  exerciseDetails: {
    fontSize: typography.sizes.sm,
  },
  exerciseItemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalScrollView: {
    padding: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  cancelButton: {
    flex: 0.4,
  },
  saveButton: {
    flex: 0.6,
  },
  modalButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
