import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { feedStyles } from '../Styles/feedStyles';
import { confirmAction } from '../utils/alertHelper';

export default function CommentItem({ comment, currentUser, onDeleteComment }) {
  console.log('CommentItem render:', { currentUser, comment_user_id: comment.user_id });
  const canDelete = currentUser && currentUser.id === comment.user_id;
  console.log('canDelete:', canDelete);
  
  const handleDeletePress = () => {
    confirmAction(
      'Izbriši komentar',
      'Ali ste prepričani, da želite izbrisati ta komentar?',
      () => {
        onDeleteComment(comment.id, comment.post_id);
      }
    );
  };

  return (
    <View style={feedStyles.swipeableCommentContainer}>
      <View style={feedStyles.commentSeparatorLine} />
      
      <View style={[
        feedStyles.commentItem, 
        feedStyles.commentItemModified
      ]}>
        <View style={feedStyles.commentHeader}>
          <Text style={feedStyles.commentUsername}>{comment.username}</Text>
          {canDelete && (
            <TouchableOpacity 
              onPress={handleDeletePress}
              style={{ 
                padding: 8,
                backgroundColor: '#dc3545',
                borderRadius: 4,
                minWidth: 60,
                alignItems: 'center',
                ...(Platform.OS === 'web' && {
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                })
              }}
            >
              <Text style={[feedStyles.deleteCommentText, { color: 'white', fontWeight: 'bold' }]}>
                Izbriši
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={feedStyles.commentContent}>{comment.content}</Text>
      </View>
    </View>
  );
}