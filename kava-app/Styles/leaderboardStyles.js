import { Platform, StyleSheet } from 'react-native';

export const leaderboardStyles = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  
  weekRange: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'web' ? 100 : 20,
  },
  
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  topThreeItem: {
    borderColor: '#d2691e',
    borderWidth: 2,
    backgroundColor: '#fffaf5',
  },
  
  currentUserItem: {
    backgroundColor: '#f0f8ff',
    borderColor: '#4a90d9',
  },
  
  rankBadge: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  crownEmoji: {
    fontSize: 28,
  },
  
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  
  topThreeRank: {
    color: '#d2691e',
  },
  
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d2691e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  firstPlaceAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffd700',
  },
  
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  nameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  firstPlaceUsername: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  winnerLabel: {
    fontSize: 12,
    color: '#d2691e',
    fontWeight: '600',
    marginTop: 2,
  },
  
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  coffeeEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  
  coffeeCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  topThreeCoffeeCount: {
    color: '#d2691e',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  
  emptySubtext: {
    fontSize: 16,
    color: '#d2691e',
    fontWeight: '600',
    marginTop: 8,
  },
});

export default leaderboardStyles;

