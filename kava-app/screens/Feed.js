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
  } = useFeedData();

  const renderPost = ({ item }) => {
    return (
      <PostItem 
        item={item}
        likedPosts={likedPosts}
        onImagePress={(item) => {
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
        onSubmit={() => {
          // Handle comment submit logic here
        }}
        onDeleteComment={(commentId, postId) => {
          // Handle delete comment logic here
        }}
      />
    </View>
  );
}