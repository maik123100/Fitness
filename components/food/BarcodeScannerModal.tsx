import { useTheme } from '@/app/contexts/ThemeContext';
import { shadows, spacing, typography, borderRadius } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScannerModal({ visible, onClose, onScan }: BarcodeScannerModalProps) {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    setScanned(true);
    onScan(result.data);
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  const handleRequestPermission = async () => {
    const { status } = await requestPermission();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to scan barcodes.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {permission?.granted ? (
          <>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            {scanned && (
              <TouchableOpacity
                style={[styles.scanAgainButton, { backgroundColor: theme.primary }, shadows.md]}
                onPress={() => setScanned(false)}
              >
                <Text style={[styles.scanAgainButtonText, { color: theme.text.inverse }]}>
                  Tap to Scan Again
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.danger }, shadows.md]}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color={theme.text.inverse} />
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.permissionContainer, { backgroundColor: theme.background }]}>
            <Ionicons name="camera-outline" size={64} color={theme.comment} style={styles.permissionIcon} />
            <Text style={[styles.permissionText, { color: theme.foreground }]}>
              Camera permission is required to scan barcodes
            </Text>
            <Pressable
              style={[styles.permissionButton, { backgroundColor: theme.primary }, shadows.md]}
              onPress={handleRequestPermission}
            >
              <Text style={[styles.permissionButtonText, { color: theme.text.inverse }]}>
                Grant Permission
              </Text>
            </Pressable>
            <Pressable
              style={[styles.cancelButton, { backgroundColor: theme.surface.secondary }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.foreground }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: [{ translateX: -100 }],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  scanAgainButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionIcon: {
    marginBottom: spacing.lg,
  },
  permissionText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  permissionButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
