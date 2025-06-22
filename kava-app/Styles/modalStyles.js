import { Platform, StyleSheet } from 'react-native';
import { webSafeAreaStyles, webTouchStyles } from './commonStyles';

export const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    ...(Platform.OS === 'web' && {
      ...webSafeAreaStyles,
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
    }),
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  
  starButton: {
    padding: 5,
    ...webTouchStyles,
  },
  
  star: {
    fontSize: 30,
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  fullImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  fullImage: {
    width: '100%',
    height: '100%',
  },
  
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    borderRadius: 8,
  },
  
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
});