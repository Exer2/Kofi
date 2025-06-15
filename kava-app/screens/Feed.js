import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Platform,
  Keyboard,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../backend/supabase';
import { feedStyles } from '../Styles/feedStyles';
import PostItem from '../components/PostItem';
import CommentModal from '../components/CommentModal';
import PostModal from '../components/PostModal';
import ImageModal from '../components/ImageModal';
import useFeedData from '../hooks/useFeedData';
import { setupRealtimeSubscriptions } from '../utils/realtimeUtils';
import { handleImagePicker, handleUpload } from '../utils/imageUtils';
import { toggleLike, handleCommentSubmit, deleteComment } from '../utils/feedUtils';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Feed() {
  const {
    posts,
    setPosts,
    error,
    setError,
    refreshing,
    profileData,
    likedPosts,
    setLikedPosts,
    comments,
    setComments,
    currentUser,
    loadingComments,
    fetchPosts,
    fetchUserProfile,
    fetchLikes,
    fetchComments,
    getCurrentUser,
    onRefresh
  } = useFeedData();

  // UI state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(3);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState(''); 
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Initialize data and subscriptions
  useEffect(() => {
    fetchPosts();
    fetchUserProfile();
    fetchLikes();
    getCurrentUser();
    
    const cleanup = setupRealtimeSubscriptions({
      setPosts,
      setLikedPosts,
      setComments,
      fetchPosts,
      fetchLikes,
      fetchComments,
      currentUser,
      selectedPostForComment
    });

    return cleanup;
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        LayoutAnimation.configureNext({
          duration: 250,
          create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
          update: { type: LayoutAnimation.Types.easeInEaseOut },
        });
        setKeyboardVisible(true);
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext({
          duration: 250,
          create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
          update: { type: LayoutAnimation.Types.easeInEaseOut },
        });
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Handler functions
  const handleAddImage = () => handleImagePicker(setPendingUpload, setIsModalVisible, setError);
  
  const handleUploadWithDetails = () => handleUpload({
    pendingUpload,
    description,
    rating,
    setIsUploading,
    setIsModalVisible,
    setPendingUpload,
    setDescription,
    setRating,
    setError,
    fetchPosts
  });

  const handleToggleLike = (postId) => toggleLike({
    postId,
    currentUser,
    likedPosts,
    setLikedPosts,
    setPosts,
    setError
  });

  const handleCommentSubmitWrapper = () => handleCommentSubmit({
    commentText,
    selectedPostForComment,
    setCommentText,
    fetchComments,
    fetchPosts
  });

  const handleDeleteComment = (commentId, postId) => deleteComment({
    commentId,
    postId,
    currentUser,
    setComments,
    fetchComments,
    fetchPosts
  });

  const showCommentModal = (postId) => {
    setSelectedPostForComment(postId);
    fetchComments(postId);
    setCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPostForComment(null);
    setCommentText('');
    Keyboard.dismiss();
  };

  const handleImagePress = (item) => {
    console.log('Image pressed for post:', item.id);
    setSelectedImage(item.image_url);
    setSelectedPost(item);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedPost(null);
  };

  const handleDelete = async (postId, imageUrl) => {
    console.log('handleDelete called with:', postId, imageUrl); // Debug log
    
    try {
      const fileName = imageUrl.split('/').pop();
      console.log('Attempting to delete file:', fileName); // Debug log
      
      const { error: storageError } = await supabase.storage.from('posts').remove([fileName]);
      if (storageError) {
        console.error('Storage delete error:', storageError);
        throw storageError;
      }
      
      console.log('File deleted from storage, now deleting from database'); // Debug log

      const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId);
      if (deleteError) {
        console.error('Database delete error:', deleteError);
        throw deleteError;
      }
      
      console.log('Post deleted successfully'); // Debug log

      closeImageModal();
      fetchPosts();
      Alert.alert('Uspeh', 'Objava je bila izbrisana.');
    } catch (err) {
      console.error('Error deleting post:', err);
      Alert.alert('Napaka', `Napaka pri brisanju objave: ${err.message}`);
    }
  };

  return (
    <View style={feedStyles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            likedPosts={likedPosts}
            loadingImages={loadingImages}
            onImagePress={handleImagePress}
            onToggleLike={handleToggleLike}
            onShowComments={showCommentModal}
            setLoadingImages={setLoadingImages}
          />
        )}
        ListEmptyComponent={<Text style={feedStyles.emptyText}>Ni objav za prikaz.</Text>}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingBottom: Platform.OS === 'web' ? 160 : 80
        }}
      />
      
      <TouchableOpacity style={feedStyles.addButton} onPress={handleAddImage}>
        <Text style={feedStyles.addButtonText}>Objavi kavico</Text>
      </TouchableOpacity>
      
      {error && <Text style={feedStyles.error}>{error}</Text>}
      
      <PostModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        description={description}
        onDescriptionChange={setDescription}
        rating={rating}
        onRatingChange={setRating}
        onSubmit={handleUploadWithDetails}
        isUploading={isUploading}
      />

      <ImageModal
        visible={!!selectedImage}
        imageUrl={selectedImage}
        selectedPost={selectedPost}
        profileData={profileData}
        isImageLoading={isImageLoading}
        onClose={closeImageModal}
        onDelete={handleDelete}
        setIsImageLoading={setIsImageLoading}
      />

      <CommentModal
        visible={commentModalVisible}
        onClose={closeCommentModal}
        comments={comments}
        selectedPostForComment={selectedPostForComment}
        loadingComments={loadingComments}
        commentText={commentText}
        onCommentTextChange={setCommentText}
        onSubmitComment={handleCommentSubmitWrapper}
        keyboardVisible={keyboardVisible}
        currentUser={currentUser}
        onDeleteComment={handleDeleteComment}
      />
    </View>
  );
}