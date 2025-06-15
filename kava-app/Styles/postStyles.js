import { Platform, StyleSheet } from 'react-native';
import { webTouchStyles, isMobileWeb } from './commonStyles';

export const postStyles = StyleSheet.create({
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
    ...webTouchStyles,
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
    ...webTouchStyles,
  },
  
  likeCount: {
    marginLeft: -4,
    color: '#777',
    fontSize: 16,
  },
  
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    padding: 5,
    ...webTouchStyles,
  },
  
  commentCount: {
    color: '#777',
    fontSize: 16,
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
      ...webTouchStyles,
      userSelect: 'none',
    }),
  },
  
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  
  error: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
  },
});