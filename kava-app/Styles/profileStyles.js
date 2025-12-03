import { Platform, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const gridItemSize = (width - 48) / 3; // 3 columns with padding

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
    }),
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d2691e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  
  statItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  
  usernameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  
  bioText: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginTop: 8,
    lineHeight: 20,
  },
  
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 16,
    marginBottom: 8,
  },
  
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'web' ? 100 : 20,
    flexGrow: 1,
  },
  
  gridItem: {
    width: gridItemSize,
    height: gridItemSize,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  
  gridImage: {
    width: '100%',
    height: '100%',
  },
  
  ratingBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  
  ratingBadgeText: {
    color: '#ffd700',
    fontSize: 10,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
});

export default profileStyles;

