import React from 'react';
import { 
  Modal, 
  View, 
  Image, 
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Text,
  Platform
} from 'react-native';
import { feedStyles } from '../Styles/feedStyles';
import { confirmAction } from '../utils/alertHelper';

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
    console.log('Brisem objavo:', selectedPost?.id, selectedPost?.image_url);
    if (!selectedPost) return;
    
    confirmAction(
      'Izbriši objavo',
      'Ali ste prepričani, da želite izbrisati to objavo?',
      () => {
        onDelete(selectedPost.id, selectedPost.image_url);
      }
    );
  };

  const canDelete = selectedPost && selectedPost.username === profileData?.username;

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable 
        style={feedStyles.fullImageContainer}
        onPress={onClose}
      >
        <Pressable 
          style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
          onPress={(e) => {
            // Prepreči zapiranje modal-a ko klikneš na vsebino
            e.stopPropagation();
          }}
        >
          <TouchableOpacity 
            style={feedStyles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={feedStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {canDelete && (
            <TouchableOpacity 
              style={feedStyles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              activeOpacity={0.7}
            >
              <Text style={feedStyles.deleteButtonText}>Izbriši</Text>
            </TouchableOpacity>
          )}

          {image_url && (
            <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
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
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}