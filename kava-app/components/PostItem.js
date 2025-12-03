import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { feedStyles } from '../Styles/feedStyles';
import MyCommentIcon from '../Styles/ikonce';
import HeartOutlineIcon from '../Styles/HeartOutlineIcon';
import HeartFilledIcon from '../Styles/HeartFilledIcon';

export default function PostItem({ 
  item, 
  likedPosts, 
  onImagePress, 
  onLikePress, 
  onCommentPress,
  onUsernamePress
}) {
  const [isImageLoading, setIsImageLoading] = useState(false);

  return (
    <View style={feedStyles.postContainer}>
      <TouchableOpacity onPress={() => onUsernamePress && onUsernamePress(item.username)}>
        <Text style={[feedStyles.username, { color: '#d2691e' }]}>{item.username}</Text>
      </TouchableOpacity>
      
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
                setIsImageLoading(true);
              }
            }}
            onLoadEnd={() => {
              if (Platform.OS !== 'web') {
                setIsImageLoading(false);
              }
            }}
            onError={() => {
              if (Platform.OS !== 'web') {
                setIsImageLoading(false);
              }
            }}
          />
          {Platform.OS !== 'web' && isImageLoading && (
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
          onPress={() => onLikePress(item.id)}
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
          onPress={() => onCommentPress(item.id)}
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