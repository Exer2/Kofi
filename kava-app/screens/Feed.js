import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../backend/supabase';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(3);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});

  // Fetch posts from the database
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*');
      if (error) throw error;
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Napaka pri nalaganju objav.');
    }
  };

  // Modify handleAddImage to show modal after image selection
  const handleAddImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Dovoljenje za dostop do galerije je potrebno.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        exif: false,
      });

      if (pickerResult.canceled) return;

      const asset = pickerResult.assets[0];
      const fileName = `image-${Date.now()}.jpg`;
      
      // Store the upload data temporarily and show modal
      setPendingUpload({
        asset,
        fileName,
        formData: new FormData()
      });
      setIsModalVisible(true);

    } catch (err) {
      console.error('Error selecting image:', err);
      setError('Napaka pri izbiri slike.');
    }
  };

  // Updated function to handle the actual upload
  const handleUploadWithDetails = async () => {
    try {
      setIsUploading(true); // Start loading
      
      if (!pendingUpload) {
        Alert.alert('Napaka', 'Ni slike za nalaganje.');
        return;
      }

      // Generate a more unique filename using UUID-like format
      const uniqueFileName = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

      const formData = new FormData();
      formData.append('file', {
        uri: pendingUpload.asset.uri,
        name: uniqueFileName, // Use the unique filename
        type: 'image/jpeg'
      });

      console.log('Uploading to storage...'); // Debug log
      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(uniqueFileName, formData, { // Use the unique filename here too
          contentType: 'multipart/form-data',
          upsert: true // Change to true to overwrite if file exists
        });

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        throw uploadError;
      }

      console.log('Getting public URL...'); // Debug log
      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(uniqueFileName);
          
      if (!data?.publicUrl) {
        throw new Error('Missing public URL');
      }

      console.log('Getting user data...'); // Debug log
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userData.user.id)
        .single();

      if (profileError) throw profileError;

      console.log('Inserting post data...'); // Debug log
      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            image_url: data.publicUrl,
            username: profileData?.username || 'unknown_user',
            description: description.trim(), // Trim whitespace
            rating: parseInt(rating) // Ensure rating is a number
          },
        ])
        .select();

      if (postError) {
        console.error('Post Error:', postError);
        throw postError;
      }

      // Clear form and close modal
      setIsModalVisible(false);
      setPendingUpload(null);
      setDescription('');
      setRating(3);
      Alert.alert('Uspeh', 'Objava uspešno dodana!');
      fetchPosts(); // Refresh the feed

    } catch (err) {
      console.error('Error in handleUploadWithDetails:', err);
      Alert.alert('Napaka', 'Napaka pri nalaganju objave. Poskusite ponovno.');
      setError('Napaka pri nalaganju objave.');
    } finally {
      setIsUploading(false); // Stop loading
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPosts();
    } catch (err) {
      console.error('Error refreshing posts:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.username}>{item.username}</Text>
      <TouchableOpacity onPress={() => setSelectedImage(item.image_url)}>
        <View>
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.image}
            onLoadStart={() => {
              setLoadingImages(prev => ({
                ...prev,
                [item.id]: true
              }));
            }}
            onLoadEnd={() => {
              setLoadingImages(prev => ({
                ...prev,
                [item.id]: false
              }));
            }}
          />
          {loadingImages[item.id] && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}
      {item.rating && (
        <View style={styles.ratingDisplay}>
          <Text style={styles.ratingText}>
            {'★'.repeat(item.rating)}{'☆'.repeat(5-item.rating)}
          </Text>
        </View>
      )}
    </View>
  );

  const renderRatingStars = () => (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          style={styles.starButton}
        >
          <Text style={[
            styles.star,
            { color: star <= rating ? '#FFD700' : '#ccc' }
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderPost}
        ListEmptyComponent={<Text style={styles.emptyText}>Ni objav za prikaz.</Text>}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
        <Text style={styles.addButtonText}>Dodaj sliko</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Dodaj opis in oceno</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Opiši svojo kavo..."
                placeholderTextColor="#777"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={200}
              />
              
              {renderRatingStars()}

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Prekliči</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.submitButton]}
                  onPress={handleUploadWithDetails}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Objavi</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.fullImageContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          {selectedImage && (
            <>
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
                onLoadStart={() => setIsImageLoading(true)}
                onLoadEnd={() => setIsImageLoading(false)}
              />
              {isImageLoading && (
                <View style={styles.imageLoadingContainer}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  postContainer: {
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,           // Add border
    borderColor: '#000000',   // Black border
    borderRadius: 12,         // Rounded corners
    padding: 16,             // Add padding inside the border
    width: '100%',           // Take full width
    backgroundColor: '#fff',  // White background
    shadowColor: '#000',     // Optional: add subtle shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,            // Android shadow
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  ratingDisplay: {
    marginTop: 4,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  addButton: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  submitButton: {
    backgroundColor: 'black',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  fullImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Match the image borderRadius
  },
});