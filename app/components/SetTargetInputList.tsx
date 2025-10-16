import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SetTarget } from '@/types/types';
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SetTargetInputListProps {
  setTargets: SetTarget[];
  onChange: (setTargets: SetTarget[]) => void;
}

  const SetTargetInputList: React.FC<SetTargetInputListProps> = ({ setTargets, onChange }) => {
  const [sameForAll, setSameForAll] = useState(false);
  const [singleReps, setSingleReps] = useState('10');
  const [singleWeight, setSingleWeight] = useState('0');
  const [setAmount, setSetAmount] = useState('3');
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (sameForAll) {
      const newSetTargets: SetTarget[] = [];
      const numSets = parseInt(setAmount) || 0;
      const reps = parseFloat(singleReps) || 0;
      const weight = parseFloat(singleWeight) || 0;
      for (let i = 0; i < numSets; i++) {
        newSetTargets.push({ reps, weight });
      }
      onChange(newSetTargets);
    } else if (setTargets.length === 0) {
      onChange([{ reps: 10, weight: 0 }]); // Default to one set if switching back and no sets exist
    }
  }, [sameForAll, singleReps, singleWeight, setAmount]);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (setTargets.length > 0) {
      const firstSet = setTargets[0];
      const allSame = setTargets.every(set => set.reps === firstSet.reps && set.weight === firstSet.weight);
      if (allSame) {
        setSameForAll(true);
        setSingleReps(firstSet.reps.toString());
        setSingleWeight(firstSet.weight.toString());
        setSetAmount(setTargets.length.toString());
      } else {
        setSameForAll(false);
      }
    } else {
      setSameForAll(false);
      setSingleReps('10');
      setSingleWeight('0');
      setSetAmount('3');
    }
  }, [setTargets]);

  const addSet = () => {
    isInternalUpdate.current = true;
    onChange([...setTargets, { reps: 10, weight: 0 }]); // Default new set to 10 reps, 0 weight
  };

  const removeSet = (index: number) => {
    isInternalUpdate.current = true;
    const newSetTargets = setTargets.filter((_, i) => i !== index);
    onChange(newSetTargets);
  };
  const updateSet = (value: string, index: number, field: 'reps' | 'weight') => {
    const newSetTargets = [...setTargets];
    newSetTargets[index] = {
      ...newSetTargets[index],
      [field]: parseFloat(value) || 0, // Parse as float, default to 0 if invalid
    };
    onChange(newSetTargets);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Same Reps & Weight for all Sets</Text>
        <Switch
          trackColor={{ false: draculaTheme.comment, true: draculaTheme.green }}
          thumbColor={sameForAll ? draculaTheme.cyan : draculaTheme.foreground}
          onValueChange={setSameForAll}
          value={sameForAll}
        />
      </View>

      {sameForAll ? (
        <View>
          <Text style={styles.label}>Number of Sets</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 3"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={setAmount}
            onChangeText={setSetAmount}
          />
          <View style={styles.singleInputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputGroupLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10"
                placeholderTextColor={draculaTheme.comment}
                keyboardType="numeric"
                value={singleReps}
                onChangeText={setSingleReps}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputGroupLabel}>Weight</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 50"
                placeholderTextColor={draculaTheme.comment}
                keyboardType="numeric"
                value={singleWeight}
                onChangeText={setSingleWeight}
              />
            </View>
          </View>
        </View>
      ) : (
        <>
          {setTargets.map((set, index) => (
            <View key={index} style={styles.setRow}>
              <Text style={styles.setLabel}>Set {index + 1}:</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputGroupLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  placeholderTextColor={draculaTheme.comment}
                  keyboardType="numeric"
                  value={set.reps.toString()}
                  onChangeText={(text) => updateSet(text, index, 'reps')}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputGroupLabel}>Weight</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Weight"
                  placeholderTextColor={draculaTheme.comment}
                  keyboardType="numeric"
                  value={set.weight.toString()}
                  onChangeText={(text) => updateSet(text, index, 'weight')}
                />
              </View>
              <TouchableOpacity onPress={() => removeSet(index)} style={styles.removeButton}>
                <Ionicons name="remove-circle" size={24} color={draculaTheme.red} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={addSet} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={draculaTheme.green} />
            <Text style={styles.addButtonText}>Add Set</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  setLabel: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    marginRight: spacing.sm,
    width: 50, // Fixed width for alignment
  },
  input: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    width: '100%', // Make input fill its parent inputGroup
    textAlign: 'center',
  },
  inputGroup: {
    flex: 1,
    marginRight: spacing.sm, // Space between input groups
    alignItems: 'center',
  },
  inputGroupLabel: {
    color: draculaTheme.comment,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  removeButton: {
    padding: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  addButtonText: {
    color: draculaTheme.green,
    fontSize: typography.sizes.md,
    marginLeft: spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  toggleLabel: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  singleInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  label: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
});

export default SetTargetInputList;
