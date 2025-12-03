import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl
} from 'react-native';
import { supabase } from '../backend/supabase';
import { profileStyles } from '../Styles/profileStyles';
import { feedStyles } from '../Styles/feedStyles';
import ImageModal from '../components/ImageModal';

export default function Profile({ route, navigation }) {
  const { username } = route.params;
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  
  // Image modal state
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Fetch current logged in user's profile
  const fetchCurrentUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        setCurrentUserProfile(profile);
      }
    } catch (err) {
      console.error('Error fetching current user profile:', err);
    }
  };

  // Fetch profile data for the viewed user
  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, created_at')
        .eq('username', username)
        .single();
      
      if (error) throw error;
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Napaka pri nalaganju profila.');
    }
  };

  // Fetch posts by this user
  const fetchUserPosts = async () => {
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete post handler
  const handleDelete = async (postId, image_url) => {
    console.log('=== ZAČETEK BRISANJA ===');
    console.log('postId:', postId);
    console.log('image_url:', image_url);
    
    try {
      if (!image_url) {
        throw new Error('image_url je prazen ali undefined');
      }

      const urlWithoutParams = image_url.split('?')[0];
      const fileName = urlWithoutParams.split('/').pop();
      console.log('fileName ekstraktiran:', fileName);
      
      if (!fileName) {
        throw new Error('fileName je prazen');
      }

      console.log('Brisanje iz baze...');
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (deleteError) {
        console.error('Database napaka:', deleteError);
        throw deleteError;
      }
      
      console.log('Post uspešno izbrisan iz baze');

      console.log('Brisanje iz storage...');
      const { error: storageError } = await supabase.storage
        .from('posts')
        .remove([fileName]);
      
      if (storageError) {
        console.warn('Storage opozorilo (ni kritično):', storageError);
      } else {
        console.log('Datoteka uspešno izbrisana iz storage');
      }

      setSelectedImage(null);
      setSelectedPost(null);
      await fetchUserPosts();
      console.log('=== BRISANJE USPEŠNO ZAKLJUČENO ===');
    } catch (err) {
      console.error('=== NAPAKA PRI BRISANJU ===');
      console.error('Error:', err.message);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserPosts();
  }, [username]);

  useEffect(() => {
    fetchCurrentUserProfile();
    fetchProfileData();
    fetchUserPosts();
  }, [username]);

  // Update navigation title
  useEffect(() => {
    navigation.setOptions({
      title: `@${username}`,
    });
  }, [username, navigation]);

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

  return (
    <View style={profileStyles.container}>
      {/* Profile Header */}
      <View style={profileStyles.header}>
        <View style={profileStyles.avatarContainer}>
          <Text style={profileStyles.avatarText}>
            {username?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={profileStyles.statsContainer}>
          <View style={profileStyles.statItem}>
            <Text style={profileStyles.statNumber}>{posts.length}</Text>
            <Text style={profileStyles.statLabel}>objav</Text>
          </View>
        </View>
      </View>
      
      <Text style={profileStyles.usernameTitle}>@{username}</Text>
      
      {profileData?.created_at && (
        <Text style={profileStyles.memberSince}>
          Član od {new Date(profileData.created_at).toLocaleDateString('sl-SI', {
            year: 'numeric',
            month: 'long'
          })}
        </Text>
      )}

      {/* Divider */}
      <View style={profileStyles.divider} />

      {/* Posts Grid */}
      {error ? (
        <Text style={profileStyles.errorText}>{error}</Text>
      ) : posts.length === 0 ? (
        <View style={profileStyles.emptyContainer}>
          <Text style={profileStyles.emptyText}>Ta uporabnik še ni objavil nobene kavice.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderPost}
          numColumns={3}
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
        profileData={currentUserProfile}
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

