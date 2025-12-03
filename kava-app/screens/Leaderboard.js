import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../backend/supabase';
import { leaderboardStyles } from '../Styles/leaderboardStyles';

export default function Leaderboard() {
  const navigation = useNavigation();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [weekStart, setWeekStart] = useState(null);

  // Get start of current week (Monday)
  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        setCurrentUser(profile);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  // Fetch weekly rankings
  const fetchRankings = async () => {
    try {
      const mondayStart = getWeekStart();
      setWeekStart(mondayStart);

      // Get all posts from this week grouped by username
      const { data, error } = await supabase
        .from('posts')
        .select('username, created_at')
        .gte('created_at', mondayStart.toISOString());

      if (error) throw error;

      // Count posts per user
      const userCounts = {};
      data.forEach(post => {
        if (!userCounts[post.username]) {
          userCounts[post.username] = 0;
        }
        userCounts[post.username]++;
      });

      // Convert to array and sort
      const rankingsArray = Object.entries(userCounts)
        .map(([username, count]) => ({ username, coffeeCount: count }))
        .sort((a, b) => b.coffeeCount - a.coffeeCount)
        .slice(0, 10) // Top 10
        .map((item, index) => ({ ...item, rank: index + 1 }));

      setRankings(rankingsArray);
    } catch (err) {
      console.error('Error fetching rankings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRankings();
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchRankings();
  }, []);

  const formatWeekRange = () => {
    if (!weekStart) return '';
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const options = { day: 'numeric', month: 'short' };
    return `${weekStart.toLocaleDateString('sl-SI', options)} - ${weekEnd.toLocaleDateString('sl-SI', options)}`;
  };

  const renderRankItem = ({ item, index }) => {
    const isTopThree = item.rank <= 3;
    const isCurrentUser = currentUser?.username === item.username;
    const isFirst = item.rank === 1;

    return (
      <TouchableOpacity
        style={[
          leaderboardStyles.rankItem,
          isTopThree && leaderboardStyles.topThreeItem,
          isCurrentUser && leaderboardStyles.currentUserItem,
        ]}
        onPress={() => navigation.navigate('Profile', { username: item.username })}
        activeOpacity={0.7}
      >
        <View style={leaderboardStyles.rankBadge}>
          {isFirst ? (
            <Text style={leaderboardStyles.crownEmoji}>👑</Text>
          ) : (
            <Text style={[
              leaderboardStyles.rankNumber,
              isTopThree && leaderboardStyles.topThreeRank
            ]}>
              #{item.rank}
            </Text>
          )}
        </View>

        <View style={leaderboardStyles.userInfo}>
          <View style={[
            leaderboardStyles.avatar,
            isFirst && leaderboardStyles.firstPlaceAvatar
          ]}>
            <Text style={leaderboardStyles.avatarText}>
              {item.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={leaderboardStyles.nameContainer}>
            <Text style={[
              leaderboardStyles.username,
              isFirst && leaderboardStyles.firstPlaceUsername
            ]}>
              {item.username}
            </Text>
            {isFirst && (
              <Text style={leaderboardStyles.winnerLabel}>Naj kavopivec tedna!</Text>
            )}
          </View>
        </View>

        <View style={leaderboardStyles.scoreContainer}>
          <Text style={leaderboardStyles.coffeeEmoji}>☕</Text>
          <Text style={[
            leaderboardStyles.coffeeCount,
            isTopThree && leaderboardStyles.topThreeCoffeeCount
          ]}>
            {item.coffeeCount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={leaderboardStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#d2691e" />
      </View>
    );
  }

  return (
    <View style={leaderboardStyles.container}>
      {/* Header */}
      <View style={leaderboardStyles.header}>
        <Text style={leaderboardStyles.title}>Lestvica</Text>
        <Text style={leaderboardStyles.weekRange}>{formatWeekRange()}</Text>
      </View>

      {/* Rankings List */}
      {rankings.length === 0 ? (
        <View style={leaderboardStyles.emptyContainer}>
          <Text style={leaderboardStyles.emptyEmoji}>☕</Text>
          <Text style={leaderboardStyles.emptyText}>
            Ta teden še ni nihče objavil kavice.
          </Text>
          <Text style={leaderboardStyles.emptySubtext}>
            Bodi prvi!
          </Text>
        </View>
      ) : (
        <FlatList
          data={rankings}
          keyExtractor={(item) => item.username}
          renderItem={renderRankItem}
          style={{ flex: 1 }}
          contentContainerStyle={leaderboardStyles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#d2691e']}
              tintColor="#d2691e"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

