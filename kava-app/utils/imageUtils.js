import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../backend/supabase';

/**
 * Handles opening the image picker and setting the selected image.
 */
export const handleImagePicker = async (setPendingUpload, setIsModalVisible, setError) => {
  try {
    // Request permission for camera roll on mobile
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Opozorilo', 'Potrebujemo dovoljenje za dostop do vaših fotografij.');
        return;
      }
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Enforce a square aspect ratio
      quality: 0.8,   // Compress image to 80% quality
      allowsMultipleSelection: false,
    });

    console.log('ImagePicker result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
    
      // Set the selected image and open the modal for description/rating
      setPendingUpload(asset);
      setIsModalVisible(true);
    }
  } catch (error) {
    console.error('Error picking image:', error);
    setError('Napaka pri izbiri slike. Poskusite znova.');
    Alert.alert('Napaka', 'Prišlo je do napake pri izbiri slike.');
  }
};

/**
 * Handles uploading the image and post details to Supabase.
 */
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
    Alert.alert('Napaka', 'Slika za objavo ni izbrana.');
    return;
  }

  try {
    setIsUploading(true);
    setError(null);
    console.log('Starting upload process...');

    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw userError || new Error('Uporabnik ni prijavljen.');
    }

    // 2. Get user's profile to find their username
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    
    const mimeType = pendingUpload.mimeType || 'image/jpeg'; 
    const fileExt = mimeType.split('/')[1];                  
   

    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const response = await fetch(pendingUpload.uri);
    const blob = await response.blob();

    // 4. Upload image to Supabase Storage
    console.log('Uploading to Supabase storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('posts') // Your bucket name
      .upload(filePath, blob, {
        contentType: blob.type || `image/${fileExt}`,
        upsert: false,
        cacheControl: '3600'
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      throw new Error('Napaka pri pridobivanju URL-ja slike.');
    }
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

    if (insertError) {
      await supabase.storage.from('posts').remove([filePath]);
      throw insertError;
    }

    console.log('Post saved to database successfully!');
    Alert.alert('Uspeh', 'Vaša kava je bila objavljena!');

    setIsModalVisible(false);
    setPendingUpload(null);
    setDescription('');
    setRating(3);
    
    await fetchPosts();

  } catch (error) {
    const errorMessage = error.message || 'Prišlo je do napake pri objavljanju.';
    setError(errorMessage);
    Alert.alert('Napaka', errorMessage);
  } finally {
    setIsUploading(false);
  }
};