import React from 'react';
import { 
  Modal, 
  View, 
  Image, 
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Text,
  Alert,
  Platform
} from 'react-native';
import { feedStyles } from '../Styles/feedStyles';

export default function ImageModal({
  visible,
  imageUrl,
  selectedPost,
  profileData,
  isImageLoading,
  onClose,
  onDelete,
  setIsImageLoading
}) {
  const handleDelete = () => {
    console.log('Delete button pressed'); // Debug log
    console.log('Selected post:', selectedPost); // Debug log
    console.log('Profile data:', profileData); // Debug log
    
    if (!selectedPost) {
      Alert.alert('Napaka', 'Ni izbrane objave za brisanje.');
      return;
    }

    Alert.alert(
      'Izbriši objavo',
      'Ali ste prepričani, da želite izbrisati to objavo?',
      [
        { text: 'Prekliči', style: 'cancel' },
        {
          text: 'Izbriši',
          onPress: () => {
            console.log('Calling onDelete with:', selectedPost.id, selectedPost.image_url); // Debug log
            onDelete(selectedPost.id, selectedPost.image_url);
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Check if user can delete this post
  const canDelete = selectedPost && profileData && selectedPost.username === profileData.username;
  
  console.log('Can delete:', canDelete); // Debug log
  console.log('Selected post username:', selectedPost?.username); // Debug log
  console.log('Profile username:', profileData?.username); // Debug log

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={feedStyles.fullImageContainer}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <>
              <TouchableOpacity 
                style={feedStyles.closeButton}
                onPress={onClose}
              >
                <Text style={feedStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {canDelete && (
                <TouchableOpacity 
                  style={[feedStyles.deleteButton, {
                    ...(Platform.OS === 'web' && {
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    })
                  }]}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <Text style={feedStyles.deleteButtonText}>Izbriši</Text>
                </TouchableOpacity>
              )}

              {imageUrl && (
                <>
                  <Image
                    source={{ uri: imageUrl }}
                    style={feedStyles.fullImage}
                    resizeMode="contain"
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
                  />
                  {Platform.OS !== 'web' && isImageLoading && (
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
  );
}