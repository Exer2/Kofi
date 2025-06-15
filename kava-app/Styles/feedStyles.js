import { Platform, StyleSheet, Dimensions } from 'react-native';

// Detect mobile browser
const isMobileWeb = Platform.OS === 'web' && 
  (typeof window !== 'undefined' && 
   ('ontouchstart' in window || navigator.maxTouchPoints > 0));

export const feedStyles = StyleSheet.create({
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
    bottom: Platform.OS === 'web' ? (isMobileWeb ? 60 : 30) : 30,
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
  error: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
  },
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
    paddingBottom: Platform.OS === 'android' ? 24 : 16, // Extra padding on Android
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'relative',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Vertikalno centriranje
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    gap: 12, // Razmik med input in gumbom
  },
  
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25, // Bolj okrogel input
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 44, // Zagotovi konstantno višino
  },
  
  commentSubmitButton: {
    backgroundColor: '#d2691e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80, // Minimalna širina gumba
    minHeight: 44, // Enaka višina kot input
  },
  
  commentSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeCommentModalButton: {
    marginTop: 10,
    alignSelf: 'center',
    padding: 10,
  },
  emptyCommentsText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  swipeableCommentContainer: {
    position: 'relative', 
    marginBottom: 10,
  },
  commentSeparatorLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: -80, // Extend to include delete button
    height: 1,
    backgroundColor: '#e0e0e0',
    zIndex: 1,
  },
  commentItemModified: {
    borderBottomWidth: 0,
    paddingTop: 2,
    paddingBottom: 12,
    marginBottom: 0,
    marginTop: 0,
  },
  deleteActionContainer: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingVertical: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    flex: 1,
    height: '110%',
    marginTop: -12,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: 'white', 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  commentModalContentAndroid: (keyboardVisible) => ({
    maxHeight: '80%',
    position: 'relative',
    marginTop: keyboardVisible ? 95 : 350,
    paddingBottom: 20,
  }),
  commentModalContentIOS: (keyboardVisible) => ({
    maxHeight: '80%',
    position: 'relative',
    marginTop: keyboardVisible ? 140 : 420,
    paddingBottom: 0,
  }),
});