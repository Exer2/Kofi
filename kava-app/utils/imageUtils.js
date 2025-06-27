import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../backend/supabase';
import { decode } from 'base64-js'; // Import the decoder

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

  let filePath; // Define filePath here to be accessible in the whole function scope

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

    // 3. & 4. Prepare and Upload Image
    const isDataUri = pendingUpload.uri.startsWith('data:');
    let uploadError;

    if (isDataUri && Platform.OS === 'web') {
      // On WEB, decode the base64 data URI manually.
      console.log('Handling data URI on web...');
      const dataUri = pendingUpload.uri;
      const matches = dataUri.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid data URI format on web.');
      }
      
      const mimeType = matches[1];
      const base64 = matches[2];
      const fileExt = mimeType.split('/')[1] || 'jpg';
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      filePath = fileName;

      const byteArray = decode(base64);
      const blob = new Blob([byteArray], { type: mimeType });

      const result = await supabase.storage
        .from('posts')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: false,
          cacheControl: '3600'
        });
      uploadError = result.error;
    } else {
      // On MOBILE, fetch the local file URI to get a blob.
      console.log('Handling file URI on mobile...');
      const mimeType = pendingUpload.mimeType || 'image/jpeg';
      const fileExt = mimeType.split('/')[1] || 'jpg';
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      filePath = fileName; // Assign to the outer scope variable

      const response = await fetch(pendingUpload.uri);
      const blob = await response.blob();

      const result = await supabase.storage
        .from('posts')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: false,
          cacheControl: '3600'
        });
      uploadError = result.error;
    }

    if (uploadError) {
      console.error('Supabase storage error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful, file path:', filePath);

    // 5. Get the public URL of the uploaded image
    const { data: urlData } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      throw new Error('Napaka pri pridobivanju URL-ja slike.');
    }

    // 6. Save post details to the 'posts' database table
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
      // Attempt to clean up the uploaded file if the database insert fails
      await supabase.storage.from('posts').remove([filePath]);
      throw insertError;
    }

    console.log('Post saved to database successfully!');
    Alert.alert('Uspeh', 'Vaša kava je bila objavljena!');

    // 7. Reset form and close modal
    setIsModalVisible(false);
    setPendingUpload(null);
    setDescription('');
    setRating(3);
    
    // 8. Refresh the feed to show the new post
    await fetchPosts();

  } catch (error) {
    const errorMessage = error.message || 'Prišlo je do napake pri objavljanju.';
    console.error('Full error during upload:', error);
    setError(errorMessage);
    Alert.alert('Napaka', errorMessage);
  } finally {
    setIsUploading(false);
  }
};