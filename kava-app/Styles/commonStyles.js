import { Platform, StyleSheet } from 'react-native';

// Detect mobile browser
export const isMobileWeb = Platform.OS === 'web' && 
  (typeof window !== 'undefined' && 
   ('ontouchstart' in window || navigator.maxTouchPoints > 0));

// Common web touch styles
export const webTouchStyles = Platform.OS === 'web' ? {
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
} : {};

// Common web safe area styles
export const webSafeAreaStyles = Platform.OS === 'web' ? {
  paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
  bottom: 'env(safe-area-inset-bottom)',
} : {};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: isMobileWeb ? 'env(safe-area-inset-bottom)' : 0,
    }),
  },
  
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  
  submitButton: {
    backgroundColor: 'black',
  },
  
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});