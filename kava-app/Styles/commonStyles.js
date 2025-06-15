import { Platform, StyleSheet } from 'react-native';

// Detect mobile browser
export const isMobileWeb = Platform.OS === 'web' && 
  (typeof window !== 'undefined' && 
   ('ontouchstart' in window || navigator.maxTouchPoints > 0));

// Enhanced web touch styles - to prevent zoom
export const webTouchStyles = Platform.OS === 'web' ? {
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  MsUserSelect: 'none',
  userSelect: 'none',
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
      // Add web-specific styles to prevent zoom
      touchAction: 'manipulation',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      MsUserSelect: 'none',
      userSelect: 'none',
    }),
  },
  
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    ...webTouchStyles, // Add touch styles to buttons
  },
  
  cancelButton: {
    backgroundColor: '#dc3545',
    ...webTouchStyles,
  },
  
  submitButton: {
    backgroundColor: 'black',
    ...webTouchStyles,
  },
  
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    ...(Platform.OS === 'web' && {
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      MsUserSelect: 'none',
      userSelect: 'none',
    }),
  },
  
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
    ...webTouchStyles,
  },
  
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    ...(Platform.OS === 'web' && {
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      MsUserSelect: 'none',
      userSelect: 'none',
    }),
  },
});