import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../backend/supabase';

export const handleImagePicker = async (setPendingUpload, setIsModalVisible, setError) => {
  try {
    // Request permission for camera roll
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Opozorilo', 'Potrebujemo dovoljenje za dostop do fotografij.');
        return;
      }
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    console.log('ImagePicker result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      console.log('Selected image:', asset.uri);
      
      setPendingUpload(asset);
      setIsModalVisible(true);
    }
  } catch (error) {
    console.error('Error picking image:', error);
    setError('Napaka pri izbiri slike.');
  }
};

export const handleUpload = async ({
  pendingUpload,
  description,
  rating,
  setIsUploading,
  setIsModalVisible,
  setPendingUpload,
  setDescription,
  setRating,
  setError,
  fetchPosts
}) => {
  if (!pendingUpload) {
    Alert.alert('Napaka', 'Ni izbrane slike za objavo.');
    return;
  }

  try {
    setIsUploading(true);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Create file name
    const fileExt = pendingUpload.uri.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    let fileToUpload;

    if (Platform.OS === 'web') {
      // Web platform
      const response = await fetch(pendingUpload.uri);
      const blob = await response.blob();
      fileToUpload = blob;
    } else {
      // Mobile platforms
      const response = await fetch(pendingUpload.uri);
      const arrayBuffer = await response.arrayBuffer();
      fileToUpload = arrayBuffer;
    }

    // Upload image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, fileToUpload, {
        contentType: `image/${fileExt}`,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('posts')
      .getPublicUrl(fileName);

    // Save post to database
    const { error: insertError } = await supabase
      .from('posts')
      .insert([
        {
          user_id: user.id,
          username: profileData.username,
          image_url: urlData.publicUrl,
          description: description || null,
          rating: rating || null
        }
      ]);

    if (insertError) throw insertError;

    // Reset form
    setIsModalVisible(false);
    setPendingUpload(null);
    setDescription('');
    setRating(3);
    
    // Refresh posts
    await fetchPosts();
    
    Alert.alert('Uspeh', 'Vaša kava je bila objavljena!');

  } catch (error) {
    console.error('Error uploading:', error);
    setError('Napaka pri objavljanju. Poskusite znova.');
    Alert.alert('Napaka', 'Napaka pri objavljanju. Poskusite znova.');
  } finally {
    setIsUploading(false);
  }
};