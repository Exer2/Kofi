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
    console.log('Starting upload process...');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('User auth error:', userError);
      throw userError;
    }
    console.log('User authenticated:', user.id);

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw profileError;
    }
    console.log('Profile data:', profileData);

    // Create file name with user ID for uniqueness
    const fileExt = pendingUpload.uri.split('.').pop() || 'jpg';
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    console.log('Generated filename:', fileName);

    let fileToUpload;

    if (Platform.OS === 'web') {
      // Web platform - convert to blob
      console.log('Processing image for web upload...');
      try {
        const response = await fetch(pendingUpload.uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        fileToUpload = await response.blob();
        console.log('Image converted to blob, size:', fileToUpload.size);
      } catch (fetchError) {
        console.error('Error converting image to blob:', fetchError);
        throw new Error('Napaka pri pripravi slike za upload.');
      }
    } else {
      // Mobile platforms
      console.log('Processing image for mobile upload...');
      try {
        const response = await fetch(pendingUpload.uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        fileToUpload = await response.arrayBuffer();
        console.log('Image converted to arrayBuffer, size:', fileToUpload.byteLength);
      } catch (fetchError) {
        console.error('Error converting image to arrayBuffer:', fetchError);
        throw new Error('Napaka pri pripravi slike za upload.');
      }
    }

    // Upload image to Supabase Storage
    console.log('Uploading to Supabase storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, fileToUpload, {
        contentType: `image/${fileExt}`,
        upsert: false,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Supabase storage error:', uploadError);
      
      // Check if it's a CORS or network error
      if (uploadError.message.includes('Failed to fetch') || 
          uploadError.message.includes('CORS') ||
          uploadError.message.includes('Network')) {
        throw new Error('Napaka pri povezavi s strežnikom. Preverite internetno povezavo.');
      }
      
      // Check if it's a file size error
      if (uploadError.message.includes('file size') || 
          uploadError.message.includes('too large')) {
        throw new Error('Slika je prevelika. Izberite manjšo sliko.');
      }
      
      // Check if it's a permissions error
      if (uploadError.message.includes('permission') || 
          uploadError.message.includes('policy')) {
        throw new Error('Nimate dovoljenja za upload slik. Kontaktirajte administratorja.');
      }
      
      throw uploadError;
    }

    console.log('Upload successful:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('posts')
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      throw new Error('Napaka pri pridobivanju URL-ja slike.');
    }

    console.log('Public URL generated:', urlData.publicUrl);

    // Save post to database
    console.log('Saving post to database...');
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
      console.error('Database insert error:', insertError);
      
      // Try to clean up uploaded file if database insert fails
      try {
        await supabase.storage.from('posts').remove([fileName]);
        console.log('Cleaned up uploaded file after database error');
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
      
      throw insertError;
    }

    console.log('Post saved to database successfully');

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
    
    // Provide more specific error messages
    let errorMessage = 'Napaka pri objavljanju. Poskusite znova.';
    
    if (error.message.includes('povezavi') || error.message.includes('Network')) {
      errorMessage = 'Napaka pri internetni povezavi. Preverite povezavo in poskusite znova.';
    } else if (error.message.includes('prevelika') || error.message.includes('size')) {
      errorMessage = 'Slika je prevelika. Izberite manjšo sliko.';
    } else if (error.message.includes('dovoljenja') || error.message.includes('permission')) {
      errorMessage = 'Nimate dovoljenja za objavljanje. Kontaktirajte administratorja.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    Alert.alert('Napaka', errorMessage);
  } finally {
    setIsUploading(false);
  }
};