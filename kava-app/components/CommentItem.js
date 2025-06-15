import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { feedStyles } from '../Styles/feedStyles';

export default function CommentItem({ comment, currentUser, onDeleteComment }) {
  const canDelete = currentUser && currentUser.id === comment.user_id;
  
  const renderRightActions = (progress) => {
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
          onPress={() => onDeleteComment(comment.id, comment.post_id)}
        >
          <Text style={feedStyles.deleteButtonText}>Izbriši</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={feedStyles.swipeableCommentContainer}>
      <View style={feedStyles.commentSeparatorLine} />
    
      <Swipeable
        renderRightActions={canDelete ? renderRightActions : null}
        friction={2}
        rightThreshold={40}
        overshootRight={false}
      >
        <View style={[
          feedStyles.commentItem, 
          feedStyles.commentItemModified
        ]}>
          <Text style={feedStyles.commentUsername}>{comment.username}</Text>
          <Text style={feedStyles.commentContent}>{comment.content}</Text>
        </View>
      </Swipeable>
    </View>
  );
}