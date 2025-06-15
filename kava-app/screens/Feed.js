import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ActionSheetIOS,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../backend/supabase';
import { feedStyles } from '../Styles/feedStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyCommentIcon from '../Styles/ikonce';
import HeartOutlineIcon from '../Styles/HeartOutlineIcon';
import HeartFilledIcon from '../Styles/HeartFilledIcon';
import { Swipeable } from 'react-native-gesture-handler';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(3);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchPosts = async () => {
    try {
      // Reset loading images when fetching new posts
      setLoadingImages({});
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          likes:likes(count),
          comments:comments(count)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      const postsWithStats = data.map(post => ({
        ...post,
        likeCount: post.likes[0]?.count || 0,
        commentCount: post.comments[0]?.count || 0
      }));
      
      setPosts(postsWithStats);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Napaka pri nalaganju objav.');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfileData(profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const likesMap = data.reduce((acc, like) => {
        acc[like.post_id] = true;
        return acc;
      }, {});
      
      setLikedPosts(likesMap);
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (likedPosts[postId]) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setLikedPosts(prev => ({
          ...prev,
          [postId]: false
        }));
      } else {
        const { error } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: user.id }]);
        
        if (error) throw error;
        
        setLikedPosts(prev => ({
          ...prev,
          [postId]: true
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      Alert.alert('Napaka', 'Napaka pri všečkanju objave.');
    }
  };

  const handleAddImage = async () => {
    try {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

      if (!galleryStatus.granted || !cameraStatus.granted) {
        Alert.alert('Dovoljenje', 'Potrebujemo dovoljenje za dostop do galerije in kamere.');
        return;
      }

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Prekliči', 'Izberi iz galerije', 'Fotografiraj'],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              await pickImage();
            } else if (buttonIndex === 2) {
              await takePhoto();
            }
          }
        );
      } else {
        Alert.alert(
          'Dodaj sliko',
          'Izberite vir slike',
          [
            { text: 'Prekliči', style: 'cancel' },
            { text: 'Izberi iz galerije', onPress: () => pickImage() },
            { text: 'Fotografiraj', onPress: () => takePhoto() },
          ]
        );
      }
    } catch (err) {
      console.error('Error in handleAddImage:', err);
      setError('Napaka pri izbiri slike.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const fileName = `image-${Date.now()}.jpg`;
        setPendingUpload({
          asset,
          fileName,
          formData: new FormData()
        });
        setIsModalVisible(true);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Napaka pri izbiri slike iz galerije.');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const fileName = `image-${Date.now()}.jpg`;
        setPendingUpload({
          asset,
          fileName,
          formData: new FormData()
        });
        setIsModalVisible(true);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Napaka pri fotografiranju.');
    }
  };

  const handleUploadWithDetails = async () => {
    try {
      setIsUploading(true);
      
      if (!pendingUpload) {
        Alert.alert('Napaka', 'Ni slike za nalaganje.');
        return;
      }

      const uniqueFileName = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

      const formData = new FormData();
      formData.append('file', {
        uri: pendingUpload.asset.uri,
        name: uniqueFileName,
        type: 'image/jpeg'
      });

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(uniqueFileName, formData, {
          contentType: 'multipart/form-data',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(uniqueFileName);
          
      if (!data?.publicUrl) {
        throw new Error('Missing public URL');
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userData.user.id)
        .single();

      if (profileError) throw profileError;

      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            image_url: data.publicUrl,
            username: profileData?.username || 'unknown_user',
            description: description.trim(),
            rating: parseInt(rating)
          },
        ])
        .select();

      if (postError) {
        console.error('Post Error:', postError);
        throw postError;
      }

      setIsModalVisible(false);
      setPendingUpload(null);
      setDescription('');
      setRating(3);
      Alert.alert('Uspeh', 'Objava uspešno dodana!');
      fetchPosts();

    } catch (err) {
      console.error('Error in handleUploadWithDetails:', err);
      Alert.alert('Napaka', 'Napaka pri nalaganju objave. Poskusite ponovno.');
      setError('Napaka pri nalaganju objave.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (postId, imageUrl) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const fileName = imageUrl.split('/').pop();

      const { error: storageError } = await supabase.storage
        .from('posts')
        .remove([fileName]);
      if (storageError) throw storageError;

      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      if (deleteError) throw deleteError;

      setSelectedImage(null);
      setSelectedPost(null);
      fetchPosts();
      Alert.alert('Uspeh', 'Objava je bila izbrisana.');
    } catch (err) {
      console.error('Error deleting post:', err);
      Alert.alert('Napaka', 'Napaka pri brisanju objave.');
    }
  };

  const fetchComments = async (postId) => {
    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setComments(prevComments => ({
        ...prevComments,
        [postId]: data
      }));
    } catch (err) {
      console.error('Error fetching comments:', err);
      Alert.alert('Napaka', 'Napaka pri nalaganju komentarjev.');
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || !selectedPostForComment) {
      return;
    }
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: selectedPostForComment,
            user_id: user.id,
            username: profile.username,
            content: commentText.trim(),
          }
        ]);

      if (error) throw error;

      // Update comment count in UI
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === selectedPostForComment 
            ? { ...post, commentCount: (post.commentCount || 0) + 1 }
            : post
        )
      );

      // Refresh comments for this post
      fetchComments(selectedPostForComment);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
      Alert.alert('Napaka', 'Napaka pri dodajanju komentarja.');
    }
  };

  const deleteComment = async (commentId, postId) => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      // Delete the comment
      const { error } = await supabase
        .from('comments')
        .delete()
        .match({ id: commentId, user_id: user.id });
        
      if (error) throw error;
      
      // Update local state by removing the deleted comment
      setComments(prevComments => {
        const updatedComments = { ...prevComments };
        if (updatedComments[postId]) {
          updatedComments[postId] = updatedComments[postId].filter(
            comment => comment.id !== commentId
          );
        }
        return updatedComments;
      });
      
    } catch (err) {
      console.error('Error deleting comment:', err);
      Alert.alert('Napaka', 'Napaka pri brisanju komentarja.');
    }
  };

  const renderRightActions = (commentId, userId, postId, progress) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });
    
    return (
      <Animated.View 
        style={[
          feedStyles.deleteActionContainer,
          { transform: [{ translateX: trans }] }
        ]}
      >
        <TouchableOpacity
          style={feedStyles.deleteButton}
          onPress={() => deleteComment(commentId, postId)}
        >
          <Text style={feedStyles.deleteButtonText}>Izbriši</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderComment = (comment) => {
    const canDelete = currentUser && currentUser.id === comment.user_id;
    
    return (
      <View style={feedStyles.swipeableCommentContainer}>
        {/* Separator line with consistent spacing */}
        <View style={feedStyles.commentSeparatorLine} />
      
        <Swipeable
          renderRightActions={(progress) => 
            canDelete ? renderRightActions(comment.id, comment.user_id, comment.post_id, progress) : null
          }
          friction={2}
          rightThreshold={40}
          overshootRight={false}
        >
          <View style={[
            feedStyles.commentItem, 
            feedStyles.commentItemModified
          ]} key={comment.id}>
            <Text style={feedStyles.commentUsername}>{comment.username}</Text>
            <Text style={feedStyles.commentContent}>{comment.content}</Text>
          </View>
        </Swipeable>
      </View>
    );
  };

  const showCommentModal = (postId) => {
    setSelectedPostForComment(postId);
    fetchComments(postId);
    setCommentModalVisible(true);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPosts();
    } catch (err) {
      console.error('Error refreshing posts:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchUserProfile();
    fetchLikes();
    
    const getCurrentUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setCurrentUser(data.user);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    
    getCurrentUser();
    
    // Subscribe to posts table changes
    const postSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' }, 
        payload => {
          console.log('Posts change detected:', payload);
          fetchPosts();
        }
      )
      .subscribe();
    
    // Replace your existing like subscription
    const likeSubscription = supabase
      .channel('likes_channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        async payload => {
          console.log('Like change detected:', payload);
          
          // For DELETE events, payload.old might not contain post_id
          if (payload.eventType === 'DELETE' && !payload.old.post_id) {
            console.log('This is a DELETE event without post_id, refreshing all post counts');
            
            // Update counts for all posts when we can't determine which specific post was affected
            try {
              const { data, error } = await supabase
                .from('posts')
                .select(`
                  id,
                  likes:likes(count)
                `);
                
              if (error) {
                console.error('Error fetching like counts:', error);
                return;
              }
              
              // Update like counts for all posts
              setPosts(prevPosts => 
                prevPosts.map(post => {
                  const postData = data.find(p => p.id === post.id);
                  const likeCount = postData?.likes[0]?.count || 0;
                  return {
                    ...post,
                    likeCount
                  };
                })
              );
            } catch (err) {
              console.error('Error updating likes:', err);
            }
            return;
          }
          
          // For other events, proceed with the normal flow
          const postId = payload.new?.post_id || payload.old?.post_id;
          
          if (!postId) {
            console.log('No postId found in payload');
            return;
          }

          // Fetch the current accurate count from the database
          try {
            const { count, error } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', postId);
              
            if (error) {
              console.error('Error fetching like count:', error);
              return;
            }

            console.log(`Fetched updated like count for post ${postId}:`, count);
            
            // Update UI with accurate count
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.id === postId 
                  ? { ...post, likeCount: count }
                  : post
              )
            );
          } catch (err) {
            console.error('Error in fetchUpdatedCount:', err);
          }
        }
      )
      .subscribe();

    // Also fix the comment subscription for consistency
    const commentSubscription = supabase
      .channel('comments_channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        payload => {
          console.log('Comment change detected:', payload);
          
          const postId = payload.new?.post_id || payload.old?.post_id;
          
          if (!postId) return;

          const fetchCommentCount = async () => {
            try {
              const { count, error } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', postId);
                
              if (error) {
                console.error('Error fetching comment count:', error);
                return;
              }

              setPosts(prevPosts => 
                prevPosts.map(post => 
                  post.id === postId 
                    ? { ...post, commentCount: count }
                    : post
                )
              );
              
              // If currently viewing this post's comments, refresh them
              if (selectedPostForComment === postId) {
                fetchComments(postId);
              }
            } catch (err) {
              console.error('Error in fetchCommentCount:', err);
            }
          };
          
          fetchCommentCount();
        }
      )
      .subscribe();

    return () => {
      postSubscription.unsubscribe();
      likeSubscription.unsubscribe();
      commentSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        LayoutAnimation.configureNext({
          duration: 250,
          create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
          },
        });
        setKeyboardVisible(true);
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext({
          duration: 250,
          create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
          },
        });
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const renderPost = ({ item }) => (
    <View style={feedStyles.postContainer}>
      <Text style={feedStyles.username}>{item.username}</Text>
      <TouchableOpacity 
        activeOpacity={1}
        onPress={() => {
          console.log('Image pressed for post:', item.id);
          setSelectedImage(item.image_url);
          setSelectedPost(item);
        }}
      >
        <View style={{ position: 'relative' }}>
          <Image 
            source={{ uri: item.image_url }} 
            style={feedStyles.image}
            onLoadStart={() => {
              setLoadingImages(prev => ({
                ...prev,
                [item.id]: true
              }));
            }}
            onLoadEnd={() => {
              setLoadingImages(prev => ({
                ...prev,
                [item.id]: false
              }));
            }}
            onError={() => {
              setLoadingImages(prev => ({
                ...prev,
                [item.id]: false
              }));
            }}
          />
          {loadingImages[item.id] && (
            <View style={feedStyles.imageLoadingOverlay}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      {item.description && (
        <Text style={feedStyles.description}>{item.description}</Text>
      )}
      {item.rating && (
        <View style={feedStyles.ratingDisplay}>
          <Text style={feedStyles.ratingText}>
            {'★'.repeat(item.rating)}{'☆'.repeat(5-item.rating)}
          </Text>
        </View>
      )}
      <View style={feedStyles.interactionBar}>
        <TouchableOpacity 
          onPress={() => toggleLike(item.id)}
          style={feedStyles.likeButton}
        >
          {likedPosts[item.id] ? (
            <HeartFilledIcon width={24} height={24} fill="#ff4444" />
          ) : (
            <HeartOutlineIcon width={24} height={24} fill="#555" />
          )}
        </TouchableOpacity>
        <Text style={feedStyles.likeCount}>
          {item.likeCount || 0}
        </Text>
        <TouchableOpacity 
          onPress={() => showCommentModal(item.id)}
          style={feedStyles.commentButton}
        >
          <MyCommentIcon width={20} height={20} fill="#555" />
        </TouchableOpacity>
        <Text style={feedStyles.commentCount}>
          {item.commentCount || 0}
        </Text>
      </View>
    </View>
  );

  const renderRatingStars = () => (
    <View style={feedStyles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          style={feedStyles.starButton}
        >
          <Text style={[
            feedStyles.star,
            { color: star <= rating ? '#FFD700' : '#ccc' }
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={feedStyles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderPost}
        ListEmptyComponent={<Text style={feedStyles.emptyText}>Ni objav za prikaz.</Text>}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }} // Added paddingBottom
      />
      <TouchableOpacity style={feedStyles.addButton} onPress={handleAddImage}>
        <Text style={feedStyles.addButtonText}>Objavi kavico</Text>
      </TouchableOpacity>
      {error && <Text style={feedStyles.error}>{error}</Text>}
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={feedStyles.modalContainer}>
            <View style={feedStyles.modalContent}>
              <Text style={feedStyles.modalTitle}>Dodaj opis in oceno</Text>
              
              <TextInput
                style={feedStyles.input}
                placeholder="Opiši svojo kavo..."
                placeholderTextColor="#777"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={200}
              />
              
              {renderRatingStars()}

              <View style={feedStyles.modalButtons}>
                <TouchableOpacity 
                  style={[feedStyles.button, feedStyles.cancelButton]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={feedStyles.buttonText}>Prekliči</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[feedStyles.button, feedStyles.submitButton]}
                  onPress={handleUploadWithDetails}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={feedStyles.buttonText}>Objavi</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => {
          setSelectedImage(null);
          setSelectedPost(null);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setSelectedImage(null);
            setSelectedPost(null);
          }}
        >
          <View style={feedStyles.fullImageContainer}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <>
                <TouchableOpacity 
                  style={feedStyles.closeButton}
                  onPress={() => {
                    setSelectedImage(null);
                    setSelectedPost(null);
                  }}
                >
                  <Text style={feedStyles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                {selectedPost && selectedPost.username === profileData?.username && (
                  <TouchableOpacity 
                    style={feedStyles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Izbriši objavo',
                        'Ali ste prepričani, da želite izbrisati to objavo?',
                        [
                          { text: 'Prekliči', style: 'cancel' },
                          {
                            text: 'Izbriši',
                            onPress: () => handleDelete(selectedPost.id, selectedPost.image_url),
                            style: 'destructive',
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={feedStyles.deleteButtonText}>Izbriši</Text>
                  </TouchableOpacity>
                )}

                {selectedImage && (
                  <>
                    <Image
                      source={{ uri: selectedImage }}
                      style={feedStyles.fullImage}
                      resizeMode="contain"
                      onLoadStart={() => setIsImageLoading(true)}
                      onLoadEnd={() => setIsImageLoading(false)}
                    />
                    {isImageLoading && (
                      <View style={feedStyles.imageLoadingContainer}>
                        <ActivityIndicator size="large" color="white" />
                      </View>
                    )}
                  </>
                )}
              </>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"  // Changed from "slide" to "fade" for better background appearance
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setCommentModalVisible(false);
              setSelectedPostForComment(null);
              setCommentText('');
            }}
          >
            <View style={[feedStyles.modalOverlay, { justifyContent: 'center' }]}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={[
                  feedStyles.modalContent, 
                  Platform.OS === 'android' 
                    ? { ...feedStyles.commentModalContentAndroid(keyboardVisible) }
                    : { ...feedStyles.commentModalContentIOS(keyboardVisible) }
                ]}>
                  <View style={feedStyles.commentsHeader}>
                    <Text style={feedStyles.commentsTitle}>Komentarji</Text>
                    <TouchableOpacity 
                      style={feedStyles.closeHeaderButton}
                      onPress={() => {
                        setCommentModalVisible(false);
                        setSelectedPostForComment(null);
                        setCommentText('');
                      }}
                    >
                      <Text style={{fontSize: 20, fontWeight: 'bold'}}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={{height: '70%'}}>
                    {loadingComments ? (
                      <ActivityIndicator size="large" color="#000" style={{marginTop: 20}} />
                    ) : (
                      <FlatList
                        data={comments[selectedPostForComment] || []}
                        keyExtractor={(item) => item.id?.toString()}
                        renderItem={({item}) => renderComment(item)}
                        style={feedStyles.commentsList}
                        ListEmptyComponent={
                          <Text style={feedStyles.noCommentsText}>Ni komentarjev.</Text>
                        }
                      />
                    )}
                  </View>
                  
                  <View style={feedStyles.addCommentContainer}>
                    <TextInput
                      style={feedStyles.commentInput}
                      placeholder="Kaj pa ti praviš na kavico?..."
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                    />
                    <TouchableOpacity 
                      style={[
                        feedStyles.addCommentButton, 
                        !commentText.trim() && feedStyles.addCommentButtonDisabled
                      ]}
                      onPress={addComment}
                      disabled={!commentText.trim()}
                    >
                      <Text style={feedStyles.addCommentButtonText}>Povej</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}