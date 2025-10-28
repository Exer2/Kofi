import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Platform,
} from 'react-native';
import { feedStyles } from '../Styles/feedStyles';
import useFeedData from '../hooks/useFeedData';
import PostItem from '../components/PostItem';
import PostModal from '../components/PostModal';
import ImageModal from '../components/ImageModal';
import CommentModal from '../components/CommentModal';
import { handleCommentSubmit, deleteComment } from '../utils/feedUtils';

export default function Feed() {
  const {
    posts,
    error,
    refreshing,
    onRefresh,
    toggleLikePost,
    setSelectedImage,
    setSelectedPost,
    handleAddImage,
    isModalVisible,
    setIsModalVisible,
    description,
    setDescription,
    rating,
    setRating,
    isUploading,
    handleUploadWithDetails,
    selectedImage,
    selectedPost,
    profileData,
    handleDelete,
    likedPosts,
    comments,
    setCommentText,
    commentText,
    commentModalVisible,
    setCommentModalVisible,
    selectedPostForComment,
    setSelectedPostForComment,
    loadingComments,
    keyboardVisible,
    currentUser,
    fetchComments,
    isImageLoading,
    setIsImageLoading,
    fetchPosts,
    setComments
  } = useFeedData();



    const handleCommentSubmitPress = () => {
    handleCommentSubmit({
      commentText,
      selectedPostForComment,
      setCommentText,
      fetchComments,
      fetchPosts
    });
  };

  const handleDeleteCommentPress = (commentId, postId) => {
    deleteComment({
      commentId,
      postId,
      currentUser,
      setComments,
      fetchComments,
      fetchPosts
    });
  };

  const renderPost = ({ item }) => {
    return (
      <PostItem 
        item={item}
        likedPosts={likedPosts}
        onImagePress={(item) => {
          console.log('Setting selectedPost:', item);
          setSelectedImage(item.image_url);
          setSelectedPost(item);
        }}
        onLikePress={toggleLikePost}
        onCommentPress={(postId) => {
          setSelectedPostForComment(postId);
          fetchComments(postId);
          setCommentModalVisible(true);
        }}
      />
    );
  };

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
        description={description}
        setDescription={setDescription}
        rating={rating}
        setRating={setRating}
        isUploading={isUploading}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleUploadWithDetails}
      />

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

      <CommentModal 
        visible={commentModalVisible}
        comments={comments}
        commentText={commentText}
        setCommentText={setCommentText}
        selectedPostForComment={selectedPostForComment}
        loadingComments={loadingComments}
        keyboardVisible={keyboardVisible}
        currentUser={currentUser}
        onClose={() => {
          setCommentModalVisible(false);
          setSelectedPostForComment(null);
          setCommentText('');
        }}
        onSubmit={handleCommentSubmitPress}
        onDeleteComment={handleDeleteCommentPress}
      />
    </View>
  );
}