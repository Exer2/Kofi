import { StyleSheet } from 'react-native';

export const appStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -150,
    padding: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#ffffff', // White text for better visibility on background
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  circleButton: {
    //light brown background color
    backgroundColor: '#14120f', // Light brown color
    width: 60, // Larger size
    height: 60, // Larger size
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Stronger elevation for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff', // White border for contrast
  },
  errorContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20
  },
  errorText: {
    color: 'red',
    fontSize: 16
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  }
});