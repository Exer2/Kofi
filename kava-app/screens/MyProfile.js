import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Alert
} from 'react-native';
import { supabase } from '../backend/supabase';
import { profileStyles } from '../Styles/profileStyles';
import ImageModal from '../components/ImageModal';

export default function MyProfile() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [weeklyRank, setWeeklyRank] = useState(null);
  const [weeklyCoffeeCount, setWeeklyCoffeeCount] = useState(0);
  
  // Image modal state
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Get start of current week (Monday)
  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  // Fetch current user's profile
  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Niste prijavljeni.');
        setLoading(false);
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setProfileData(data);
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Napaka pri nalaganju profila.');
      return null;
    }
  };

  // Fetch user's posts
  const fetchUserPosts = async (username) => {
    if (!username) return;
    
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          likes:likes(count),
          comments:comments(count)
        `)
        .eq('username', username)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithCounts = data.map(post => ({
        ...post,
        likeCount: post.likes?.[0]?.count || 0,
        commentCount: post.comments?.[0]?.count || 0
      }));

      setPosts(postsWithCounts);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setError('Napaka pri nalaganju objav.');
    }
  };

  // Fetch weekly rank
  const fetchWeeklyRank = async (username) => {
    if (!username) return;

    try {
      const mondayStart = getWeekStart();

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

      // Sort and find rank
      const sortedUsers = Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1]);

      const userRankIndex = sortedUsers.findIndex(([u]) => u === username);
      
      if (userRankIndex !== -1) {
        setWeeklyRank(userRankIndex + 1);
        setWeeklyCoffeeCount(userCounts[username] || 0);
      } else {
        setWeeklyRank(null);
        setWeeklyCoffeeCount(0);
      }
    } catch (err) {
      console.error('Error fetching weekly rank:', err);
    }
  };

  // Delete post handler
  const handleDelete = async (postId, image_url) => {
    try {
      if (!image_url) {
        throw new Error('image_url je prazen ali undefined');
      }

      const urlWithoutParams = image_url.split('?')[0];
      const fileName = urlWithoutParams.split('/').pop();
      
      if (!fileName) {
        throw new Error('fileName je prazen');
      }

      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (deleteError) throw deleteError;

      const { error: storageError } = await supabase.storage
        .from('posts')
        .remove([fileName]);
      
      if (storageError) {
        console.warn('Storage warning:', storageError);
      }

      setSelectedImage(null);
      setSelectedPost(null);
      
      // Refresh data
      if (profileData?.username) {
        await fetchUserPosts(profileData.username);
        await fetchWeeklyRank(profileData.username);
      }
      
      Alert.alert('Uspeh', 'Objava je bila izbrisana.');
    } catch (err) {
      console.error('Error deleting:', err);
      Alert.alert('Napaka', `Napaka pri brisanju: ${err.message}`);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    const profile = await fetchProfileData();
    if (profile?.username) {
      await Promise.all([
        fetchUserPosts(profile.username),
        fetchWeeklyRank(profile.username)
      ]);
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (profileData?.username) {
      await Promise.all([
        fetchUserPosts(profileData.username),
        fetchWeeklyRank(profileData.username)
      ]);
    }
    setRefreshing(false);
  }, [profileData?.username]);

  useEffect(() => {
    loadAllData();
  }, []);

  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={profileStyles.gridItem}
      onPress={() => {
        setSelectedImage(item.image_url);
        setSelectedPost(item);
      }}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.image_url }} 
        style={profileStyles.gridImage}
        resizeMode="cover"
      />
      {item.rating && (
        <View style={profileStyles.ratingBadge}>
          <Text style={profileStyles.ratingBadgeText}>
            {'★'.repeat(item.rating)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={profileStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#d2691e" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={profileStyles.loadingContainer}>
        <Text style={profileStyles.errorText}>{error || 'Napaka pri nalaganju profila.'}</Text>
      </View>
    );
  }

  return (
    <View style={profileStyles.container}>
      {/* Profile Header */}
      <View style={[profileStyles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <View style={profileStyles.avatarContainer}>
          <Text style={profileStyles.avatarText}>
            {profileData.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={profileStyles.statsContainer}>
          <View style={profileStyles.statItem}>
            <Text style={profileStyles.statNumber}>{posts.length}</Text>
            <Text style={profileStyles.statLabel}>objav</Text>
          </View>
          <View style={profileStyles.statItem}>
            <Text style={profileStyles.statNumber}>{weeklyCoffeeCount}</Text>
            <Text style={profileStyles.statLabel}>ta teden</Text>
          </View>
        </View>
      </View>
      
      <Text style={profileStyles.usernameTitle}>@{profileData.username}</Text>
      
      {/* Weekly Rank Badge */}
      {weeklyRank && (
        <View style={profileStyles.rankBadgeContainer}>
          <Text style={profileStyles.rankBadgeText}>
            {weeklyRank === 1 ? '👑 ' : ''}
            Rank #{weeklyRank} ta teden
            {weeklyRank === 1 ? ' - Naj kavopivec!' : ''}
          </Text>
        </View>
      )}
      
      {profileData?.bio && (
        <Text style={profileStyles.bioText}>{profileData.bio}</Text>
      )}

      {/* Divider */}
      <View style={profileStyles.divider} />

      {/* Posts Grid */}
      {error ? (
        <Text style={profileStyles.errorText}>{error}</Text>
      ) : posts.length === 0 ? (
        <View style={profileStyles.emptyContainer}>
          <Text style={profileStyles.emptyText}>Še nisi objavil nobene kavice.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderPost}
          numColumns={3}
          style={{ flex: 1 }}
          contentContainerStyle={profileStyles.gridContainer}
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

      {/* Image Modal */}
      <ImageModal 
        visible={!!selectedImage}
        image_url={selectedImage}
        selectedPost={selectedPost}
        profileData={profileData}
        isImageLoading={isImageLoading}
        setIsImageLoading={setIsImageLoading}
        onClose={() => {
          setSelectedImage(null);
          setSelectedPost(null);
        }}
        onDelete={handleDelete}
      />
    </View>
  );
}

