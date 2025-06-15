import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { feedStyles } from '../Styles/feedStyles';

export default function PostModal({
  visible,
  onClose,
  description,
  onDescriptionChange,
  rating,
  onRatingChange,
  onSubmit,
  isUploading
}) {
  const renderRatingStars = () => (
    <View style={feedStyles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          style={feedStyles.starButton}
        >
          <Text style={[
            feedStyles.star,
            { color: star <= rating ? '#FFD700' : '#ccc' }
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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
      >
        <View style={feedStyles.modalContainer}>
          <View style={feedStyles.modalContent}>
            <Text style={feedStyles.modalTitle}>Dodaj opis in oceno</Text>
            
            <TextInput
              style={feedStyles.input}
              placeholder="Opiši svojo kavo..."
              placeholderTextColor="#777"
              value={description}
              onChangeText={onDescriptionChange}
              multiline
              maxLength={200}
            />
            
            {renderRatingStars()}

            <View style={feedStyles.modalButtons}>
              <TouchableOpacity 
                style={[feedStyles.button, feedStyles.cancelButton]}
                onPress={onClose}
              >
                <Text style={feedStyles.buttonText}>Prekliči</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[feedStyles.button, feedStyles.submitButton]}
                onPress={onSubmit}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={feedStyles.buttonText}>Objavi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}