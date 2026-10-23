import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';

export const useFoodBarcodeScanner = (onScan: (barcode: string) => void) => {
  const [visible, setVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const open = useCallback(async () => {
    const result = await requestPermission();
    if (result.status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to scan barcodes.');
      return;
    }
    setVisible(true);
  }, [requestPermission]);

  const close = useCallback(() => setVisible(false), []);
  const scan = useCallback((barcode: string) => {
    setVisible(false);
    onScan(barcode);
  }, [onScan]);

  return { visible, open, close, scan, permission };
};
