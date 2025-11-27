import React, { createContext, ReactNode, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar } from 'react-native-paper';

import { useTheme } from '@/app/contexts/ThemeContext';

interface SnackbarContextType {
  showSnackbar: (message: string, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(3000);

  const showSnackbar = (msg: string, dur: number = 3000) => {
    setMessage(msg);
    setDuration(dur);
    setVisible(true);
  };

  const onDismissSnackbar = () => {
    setVisible(false);
    setMessage('');
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <View style={styles.snackbarContainer}>
        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackbar}
          duration={duration}
          style={{ backgroundColor: theme.surface.elevated }}
          theme={{ colors: { inverseSurface: theme.text.primary, inverseOnSurface: theme.text.primary, accent: theme.cyan } }}
          action={{
            label: 'Dismiss',
            onPress: () => {
              onDismissSnackbar();
            },
          }}
        >
          {message}
        </Snackbar>
      </View>
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
    bottom: 0,
    width: '100%',
    zIndex: 1000,
  },
});
