import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, spacing, typography } from '@/styles/theme';

interface SnackbarContextType {
  showSnackbar: (message: string, duration?: number, type?: 'success' | 'error' | 'info') => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const showSnackbar = (msg: string, dur: number = 3000, snackType: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setType(snackType);
    setVisible(true);

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    setTimeout(() => {
      dismissSnackbar();
    }, dur);
  };

  const dismissSnackbar = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setMessage('');
    });
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return theme.green;
      case 'error':
        return theme.red;
      case 'info':
      default:
        return theme.cyan;
    }
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.snackbarContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: theme.surface.elevated,
              shadowColor: theme.foreground,
            },
          ]}
        >
          <Ionicons name={getIconName()} size={24} color={getIconColor()} style={styles.icon} />
          <Text style={[styles.message, { color: theme.text.primary }]} numberOfLines={2}>
            {message}
          </Text>
          <TouchableOpacity onPress={dismissSnackbar} style={styles.dismissButton}>
            <Ionicons name="close" size={20} color={theme.text.secondary} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  snackbarContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
  },
  icon: {
    marginRight: spacing.md,
  },
  message: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.md * 1.4,
  },
  dismissButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
});
