import React, { useState, useEffect } from 'react';
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
import { supabase } from '../backend/supabase'; // ← Dodaj ta import
import { feedStyles } from '../Styles/feedStyles';
import useFeedData from '../hooks/useFeedData';
import PostItem from '../components/PostItem';
import PostModal from '../components/PostModal';
import ImageModal from '../components/ImageModal';
import CommentModal from '../components/CommentModal';
import { handleImagePicker, handleUpload } from '../utils/imageUtils';
import { toggleLike, handleCommentSubmit, deleteComment } from '../utils/feedUtils';

// Zamenjaj celotno vsebino Feed.js z novo, krajšo verzijo iz mojega prejšnjega odgovora

export default function Feed() {
  const {
    posts,
    error,
    refreshing,
    fetchPosts,
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
    pendingUpload,
    setPendingUpload,
    isUploading,
    setIsUploading,
    fetchUserProfile,
    profileData,
    likedPosts,
    comments,
    setCommentText,
    commentText,
    commentModalVisible,
    setCommentModalVisible,
    selectedPostForComment,
    setSelectedPostForComment,
    loadingComments,
    setLoadingComments,
    keyboardVisible,
    setKeyboardVisible,
    currentUser,
    setCurrentUser,
    handleUploadWithDetails,
    handleDelete,
    fetchComments,
  } = useFeedData();

  const renderPost = ({ item }) => {
    return (
      <PostItem 
        item={item}
        toggleLikePost={toggleLikePost}
        setSelectedImage={setSelectedImage}
        setSelectedPost={setSelectedPost}
        fetchComments={fetchComments}
        currentUser={currentUser}
        profileData={profileData}
        likedPosts={likedPosts}
        comments={comments}
        setCommentText={setCommentText}
        commentText={commentText}
        commentModalVisible={commentModalVisible}
        setCommentModalVisible={setCommentModalVisible}
        selectedPostForComment={selectedPostForComment}
        setSelectedPostForComment={setSelectedPostForComment}
        loadingComments={loadingComments}
        setLoadingComments={setLoadingComments}
        keyboardVisible={keyboardVisible}
        setKeyboardVisible={setKeyboardVisible}
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
        onRefresh={fetchPosts}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingBottom: Platform.OS === 'web' ? 160 : 80 // Več padding na webu
        }}
      />
      <TouchableOpacity style={feedStyles.addButton} onPress={handleAddImage}>
        <Text style={feedStyles.addButtonText}>Objavi kavico</Text>
      </TouchableOpacity>
      {error && <Text style={feedStyles.error}>{error}</Text>}
      
      <PostModal 
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        description={description}
        setDescription={setDescription}
        rating={rating}
        setRating={setRating}
        pendingUpload={pendingUpload}
        setPendingUpload={setPendingUpload}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        handleUploadWithDetails={handleUploadWithDetails}
      />

      <ImageModal 
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        setSelectedPost={setSelectedPost}
        profileData={profileData}
        handleDelete={handleDelete}
      />

      <CommentModal 
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
        selectedPostForComment={selectedPostForComment}
        setSelectedPostForComment={setSelectedPostForComment}
        fetchComments={fetchComments}
        comments={comments}
        setCommentText={setCommentText}
        commentText={commentText}
        handleCommentSubmit={handleCommentSubmit}
        loadingComments={loadingComments}
        setLoadingComments={setLoadingComments}
        keyboardVisible={keyboardVisible}
        setKeyboardVisible={setKeyboardVisible}
      />
    </View>
  );
}