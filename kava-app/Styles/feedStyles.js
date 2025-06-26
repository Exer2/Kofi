import { Platform, StyleSheet } from 'react-native';

// Import all modular styles
import { commonStyles, isMobileWeb, webTouchStyles, webSafeAreaStyles } from './commonStyles';
import { postStyles } from './postStyles';
import { modalStyles } from './modalStyles';
import { commentStyles } from './commentStyles';

// Additional styles that need to be defined here (missing from modular files)
const additionalStyles = StyleSheet.create({
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  deleteCommentText: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  commentModalContentAndroid: (keyboardVisible) => ({
    maxHeight: keyboardVisible ? '60%' : '80%',
    position: 'relative',
    marginTop: keyboardVisible ? 80 : 160,
  }),
  
  commentModalContentIOS: (keyboardVisible) => ({
    maxHeight: '80%',
    position: 'relative',
    marginTop: keyboardVisible ? 140 : Platform.OS === 'web' ? 320 : 420,
    paddingBottom: Platform.OS === 'web' ? 100 : 0,
  }),
  
  deleteButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  swipeableCommentContainer: {
    backgroundColor: 'white',
  },
  
  commentSeparatorLine: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
  },
  
  commentItemModified: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  
  deleteActionContainer: {
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
});

// Combine all styles for backward compatibility
export const feedStyles = {
  ...commonStyles,
  ...postStyles,
  ...modalStyles,
  ...commentStyles,
  ...additionalStyles,
};

// Re-export individual style modules for selective imports
export { commonStyles, isMobileWeb, webTouchStyles, webSafeAreaStyles } from './commonStyles';
export { postStyles } from './postStyles';
export { modalStyles } from './modalStyles';
export { commentStyles } from './commentStyles';

// Export the combined styles as default
export default feedStyles;