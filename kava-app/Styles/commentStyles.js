import { Platform, StyleSheet } from 'react-native';
import { webSafeAreaStyles } from './commonStyles';

export const commentStyles = StyleSheet.create({
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
    paddingBottom: Platform.OS === 'android' ? 24 : Platform.OS === 'web' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'relative',
    ...(Platform.OS === 'web' && webSafeAreaStyles),
  },
  
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    gap: 12,
  },
  
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 44,
  },
  
  commentSubmitButton: {
    backgroundColor: '#d2691e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 44,
  },
  
  commentSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Add missing styles:
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  
  // Dynamic styles as functions
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
});