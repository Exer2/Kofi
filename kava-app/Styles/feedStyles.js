import { Platform, StyleSheet, Dimensions } from 'react-native';

// Detect mobile browser
const isMobileWeb = Platform.OS === 'web' && 
  (typeof window !== 'undefined' && 
   ('ontouchstart' in window || navigator.maxTouchPoints > 0));

// Common styles
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      // Add safe area support for web
      paddingBottom: isMobileWeb ? 'env(safe-area-inset-bottom)' : 0,
    }),
  },
  error: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
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
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  likeButton: {
    padding: 8,
    ...(Platform.OS === 'web' && {
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    }),
  },
  likeIcon: {
    fontSize: 24,
    color: '#999',
  },
  likedIcon: {
    color: '#ff4444',
  },
  likeCount: {
    marginLeft: -4,
    color: '#777',
    fontSize: 16,
  },
  commentCount: {
    color: '#777',
    fontSize: 16,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    padding: 5,
    ...(Platform.OS === 'web' && {
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    }),
  },
  commentIcon: {
    fontSize: 18,
    color: '#555',
  },
};

// Post styles
export const postStyles = {
  postContainer: {
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    }),
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  ratingDisplay: {
    marginTop: 4,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  addButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? (isMobileWeb ? 60 : 80) : 30, 
    right: 20,
    backgroundColor: '#d2691e',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      marginBottom: isMobileWeb ? 20 : 0,
      touchAction: 'manipulation', // Prepreči zoom na double-tap
      WebkitTapHighlightColor: 'transparent', // Prepreči highlight
      userSelect: 'none', // Prepreči text selection
    }),
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center', // Dodal za centriranje teksta
    lineHeight: 20, // Dodal za boljše vertikalno poravnavanje
  },
};

// Modal styles
export const modalStyles = {
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
      bottom: 'env(safe-area-inset-bottom)', // Support za iOS Safari
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
    ...(Platform.OS === 'web' && {
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    }),
  },
  star: {
    fontSize: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
};

// Comment styles
export const commentStyles = {
  commentModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  commentsContainer: {
    maxHeight: '70%',
    marginBottom: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    width: '100%',
  },
  commentsList: {
    flex: 1,
    paddingTop: 10,
  },
  addCommentButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeHeaderButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  commentItem: {
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
  },
  deleteCommentText: {
    color: '#dc3545',
    fontSize: 12,
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#888',
    padding: 10,
  },
  addCommentContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : Platform.OS === 'web' ? 32 : 16, // Več padding za web
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      paddingBottom: 'max(32px, env(safe-area-inset-bottom))', // iOS Safari safe area support
    }),
  },
};

// Re-export all styles from modular files
export { commonStyles, isMobileWeb, webTouchStyles, webSafeAreaStyles } from './commonStyles';
export { postStyles } from './postStyles';
export { modalStyles } from './modalStyles';
export { commentStyles } from './commentStyles';

// Combined feedStyles object for backward compatibility
import { commonStyles } from './commonStyles';
import { postStyles } from './postStyles';
import { modalStyles } from './modalStyles';
import { commentStyles } from './commentStyles';

export const feedStyles = {
  ...commonStyles,
  ...postStyles,
  ...modalStyles,
  ...commentStyles,
};