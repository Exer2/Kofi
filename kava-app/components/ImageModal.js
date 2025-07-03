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
  image_url,
  selectedPost,
  profileData,
  isImageLoading,
  onClose,
  onDelete,
  setIsImageLoading
}) {
  const handleDelete = () => {
    console.log('Brisem objavo:', selectedPost.id, selectedPost.image_url);
    Alert.alert(
      'Izbriši objavo',
      'Ali ste prepričani, da želite izbrisati to objavo?',
      [
        { text: 'Prekliči', style: 'cancel' },
        {
          text: 'Izbriši',
          onPress: () => onDelete(selectedPost.id, selectedPost.image_url),
          style: 'destructive',
        },
      ]
    );
  };

  const canDelete = selectedPost && selectedPost.username === profileData?.username;

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
                  style={feedStyles.deleteButton}
                  onPress={handleDelete}
                >
                  <Text style={feedStyles.deleteButtonText}>Izbriši</Text>
                </TouchableOpacity>
              )}

              {image_url && (
                <>
                  <Image
                    source={{ uri: image_url }}
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