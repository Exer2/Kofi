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
    console.log('Pending upload object:', pendingUpload);

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
      // Web platform - handle blob conversion more carefully
      console.log('Processing image for web upload...');
      console.log('Image URI:', pendingUpload.uri);
      
      try {
        // Check if the URI is a blob URL or data URL
        if (pendingUpload.uri.startsWith('blob:') || pendingUpload.uri.startsWith('data:')) {
          console.log('Using blob/data URL directly');
          const response = await fetch(pendingUpload.uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          fileToUpload = await response.blob();
        } else {
          // If it's a regular URL, try fetching it
          console.log('Fetching from regular URL');
          const response = await fetch(pendingUpload.uri, {
            mode: 'cors', // Explicitly set CORS mode
            cache: 'no-cache'
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          fileToUpload = await response.blob();
        }
        console.log('Image converted to blob, size:', fileToUpload.size, 'type:', fileToUpload.type);
      } catch (fetchError) {
        console.error('Error converting image to blob:', fetchError);
        
        // Fallback: Try to create blob from file picker result directly
        if (pendingUpload.file) {
          console.log('Using file property as fallback');
          fileToUpload = pendingUpload.file;
        } else {
          throw new Error('Napaka pri pripravi slike za upload. Poskusite z drugo sliko.');
        }
      }
    } else {
      // Mobile platforms
      console.log('Processing image for mobile upload...');
      try {
        // For mobile, the URI should work directly
        console.log('Fetching from mobile URI:', pendingUpload.uri);
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

    // Validate file before upload
    if (!fileToUpload) {
      throw new Error('Napaka pri pripravi datoteke za upload.');
    }

    if (Platform.OS === 'web' && fileToUpload.size === 0) {
      throw new Error('Izbrana slika je prazna. Izberite drugo sliko.');
    }

    if (Platform.OS !== 'web' && fileToUpload.byteLength === 0) {
      throw new Error('Izbrana slika je prazna. Izberite drugo sliko.');
    }

    // Upload image to Supabase Storage
    console.log('Uploading to Supabase storage...');
    const uploadOptions = {
      contentType: `image/${fileExt}`,
      upsert: false,
      cacheControl: '3600'
    };

    console.log('Upload options:', uploadOptions);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, fileToUpload, uploadOptions);

    if (uploadError) {
      console.error('Supabase storage error:', uploadError);
      
      // More specific error handling
      if (uploadError.message.includes('Failed to fetch')) {
        throw new Error('Napaka pri povezavi s strežnikom. Preverite internetno povezavo in poskusite znova.');
      } else if (uploadError.message.includes('file size') || uploadError.message.includes('too large')) {
        throw new Error('Slika je prevelika. Izberite manjšo sliko.');
      } else if (uploadError.message.includes('permission') || uploadError.message.includes('policy')) {
        throw new Error('Nimate dovoljenja za upload slik. Kontaktirajte administratorja.');
      } else {
        throw new Error(`Upload napaka: ${uploadError.message}`);
      }
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
    
    if (error.message.includes('povezavi') || error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      errorMessage = 'Napaka pri internetni povezavi. Preverite povezavo in poskusite znova.';
    } else if (error.message.includes('prevelika') || error.message.includes('size')) {
      errorMessage = 'Slika je prevelika. Izberite manjšo sliko.';
    } else if (error.message.includes('dovoljenja') || error.message.includes('permission')) {
      errorMessage = 'Nimate dovoljenja za objavljanje. Kontaktirajte administratorja.';
    } else if (error.message.includes('prazna')) {
      errorMessage = 'Izbrana slika je neveljavna. Izberite drugo sliko.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    Alert.alert('Napaka', errorMessage);
  } finally {
    setIsUploading(false);
  }
};