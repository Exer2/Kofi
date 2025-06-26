import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { feedStyles } from '../Styles/feedStyles';
import CommentItem from './CommentItem';

export default function CommentModal({
  visible,
  comments,
  commentText,
  setCommentText,
  selectedPostForComment,
  loadingComments,
  keyboardVisible,
  currentUser,
  onClose,
  onSubmit,
  onDeleteComment
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={[feedStyles.modalOverlay, { justifyContent: 'flex-end' }]}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[
                feedStyles.commentsContainer,
                {
                  maxHeight: keyboardVisible ? '50%' : '80%',
                  paddingBottom: keyboardVisible ? 10 : 20,
                }
              ]}>
                <View style={feedStyles.commentsHeader}>
                  <Text style={feedStyles.commentsTitle}>Komentarji</Text>
                  <TouchableOpacity 
                    style={feedStyles.closeHeaderButton}
                    onPress={onClose}
                  >
                    <Text style={{fontSize: 20, fontWeight: 'bold'}}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={{flex: 1}}>
                  {loadingComments ? (
                    <ActivityIndicator size="large" color="#000" style={{marginTop: 20}} />
                  ) : (
                    <FlatList
                      data={comments[selectedPostForComment] || []}
                      keyExtractor={(item) => item.id?.toString()}
                      renderItem={({item}) => (
                        <CommentItem 
                          comment={item}
                          currentUser={currentUser}
                          onDeleteComment={onDeleteComment}
                        />
                      )}
                      style={feedStyles.commentsList}
                      ListEmptyComponent={
                        <Text style={feedStyles.noCommentsText}>Ni komentarjev.</Text>
                      }
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 10 }}
                    />
                  )}
                </View>
                
                <View style={[
                  feedStyles.commentInputContainer,
                  {
                    paddingBottom: Platform.OS === 'ios' && keyboardVisible ? 0 : 16,
                    marginBottom: Platform.OS === 'web' ? 'env(safe-area-inset-bottom)' : 0,
                  }
                ]}>
                  <TextInput
                    style={feedStyles.commentInput}
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Kaj pa ti praviš na kavico..."
                    multiline={false}
                    returnKeyType="send"
                    onSubmitEditing={onSubmit}
                  />
                  <TouchableOpacity 
                    style={feedStyles.commentSubmitButton}
                    onPress={onSubmit}
                    activeOpacity={0.8}
                  >
                    <Text style={feedStyles.commentSubmitButtonText}>Pošlji</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}