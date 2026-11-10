import { useCallback } from 'react';
import { Linking } from 'react-native';

/** Opens a resource link in the browser; a device without a browser simply does nothing. */
export function useOpenUrl() {
  return useCallback((url: string) => {
    Linking.openURL(url).catch(() => undefined);
  }, []);
}
