import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { feedStyles } from '../Styles/feedStyles';
import MyCommentIcon from '../Styles/ikonce';
import HeartOutlineIcon from '../Styles/HeartOutlineIcon';
import HeartFilledIcon from '../Styles/HeartFilledIcon';

export default function PostItem({ 
  item, 
  likedPosts, 
  loadingImages, 
  onImagePress, 
  onToggleLike, 
  onShowComments,
  setLoadingImages 
}) {
  return (
    <View style={feedStyles.postContainer}>
      <Text style={feedStyles.username}>{item.username}</Text>
      <TouchableOpacity 
        activeOpacity={1}
        onPress={() => onImagePress(item)}
      >
        <View style={{ position: 'relative' }}>
          <Image 
            source={{ uri: item.image_url }} 
            style={feedStyles.image}
            onLoadStart={() => {
              if (Platform.OS !== 'web') {
                console.log('Image loading started for post:', item.id);
                setLoadingImages(prev => ({
                  ...prev,
                  [item.id]: true
                }));
              }
            }}
            onLoad={() => {
              if (Platform.OS !== 'web') {
                console.log('Image loaded successfully for post:', item.id);
                setLoadingImages(prev => ({
                  ...prev,
                  [item.id]: false
                }));
              }
            }}
            onLoadEnd={() => {
              if (Platform.OS !== 'web') {
                console.log('Image loading ended for post:', item.id);
                setLoadingImages(prev => ({
                  ...prev,
                  [item.id]: false
                }));
              }
            }}
            onError={(error) => {
              if (Platform.OS !== 'web') {
                console.log('Image failed to load for post:', item.id, error);
                setLoadingImages(prev => ({
                  ...prev,
                  [item.id]: false
                }));
              }
            }}
          />
          {Platform.OS !== 'web' && loadingImages[item.id] && (
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
          onPress={() => onToggleLike(item.id)}
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
          onPress={() => onShowComments(item.id)}
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
}