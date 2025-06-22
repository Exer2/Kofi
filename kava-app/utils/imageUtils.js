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
      quality: 0.7, // Reduced quality for smaller file size
      allowsMultipleSelection: false,
      // Add web-specific options
      ...(Platform.OS === 'web' && {
        base64: false,
        exif: false
      })
    });

    console.log('ImagePicker result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      console.log('Selected image:', asset.uri);
      console.log('Asset details:', {
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type
      });
      
      setPendingUpload(asset);
      setIsModalVisible(true);
    }
  } catch (error) {
    console.error('Error picking image:', error);
    setError('Napaka pri izbiri slike.');
  }
};

// Helper function to create file from URI for web
const createFileFromUri = async (uri, fileName) => {
  try {
    console.log('Creating file from URI:', uri);
    
    // For web, handle different URI types
    if (Platform.OS === 'web') {
      if (uri.startsWith('blob:')) {
        // Blob URL - fetch directly
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.status}`);
        }
        const blob = await response.blob();
        
        // Create a proper File object
        const file = new File([blob], fileName, {
          type: blob.type || 'image/jpeg',
          lastModified: Date.now()
        });
        
        console.log('Created file from blob:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        return file;
      } else if (uri.startsWith('data:')) {
        // Data URL - convert to blob
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const file = new File([blob], fileName, {
          type: blob.type || 'image/jpeg',
          lastModified: Date.now()
        });
        
        console.log('Created file from data URL:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        return file;
      } else {
        // Regular URL - try to fetch
        const response = await fetch(uri, {
          mode: 'cors',
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        const blob = await response.blob();
        const file = new File([blob], fileName, {
          type: blob.type || 'image/jpeg',
          lastModified: Date.now()
        });
        
        console.log('Created file from URL:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        return file;
      }
    } else {
      // Mobile - return as ArrayBuffer
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      
      console.log('Created ArrayBuffer for mobile:', {
        size: arrayBuffer.byteLength
      });
      
      return arrayBuffer;
    }
  } catch (error) {
    console.error('Error creating file from URI:', error);
    throw error;
  }
};

// Helper function to compress image if too large
const compressImageIfNeeded = (file, maxSizeMB = 5) => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'web') {
      resolve(file);
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size <= maxSizeBytes) {
      console.log('Image size OK, no compression needed');
      resolve(file);
      return;
    }

    console.log('Image too large, compressing...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const MAX_DIMENSION = 1024;
      let { width, height } = img;
      
      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = (height * MAX_DIMENSION) / width;
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = (width * MAX_DIMENSION) / height;
          height = MAX_DIMENSION;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            console.log('Image compressed:', {
              originalSize: file.size,
              compressedSize: compressedFile.size,
              reduction: ((file.size - compressedFile.size) / file.size * 100).toFixed(1) + '%'
            });
            
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        0.8 // Quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
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
    const fileExt = pendingUpload.uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    console.log('Generated filename:', fileName);

    // Create file from URI
    let fileToUpload;
    try {
      fileToUpload = await createFileFromUri(pendingUpload.uri, fileName);
    } catch (createFileError) {
      console.error('Error creating file from URI:', createFileError);
      throw new Error('Napaka pri pripravi slike za upload. Poskusite z drugo sliko.');
    }

    // Validate file
    if (!fileToUpload) {
      throw new Error('Napaka pri pripravi datoteke za upload.');
    }

    if (Platform.OS === 'web') {
      console.log('File details before compression:', {
        name: fileToUpload.name,
        size: fileToUpload.size,
        type: fileToUpload.type
      });

      // Compress image if needed (web only)
      try {
        fileToUpload = await compressImageIfNeeded(fileToUpload);
        console.log('File after compression:', {
          name: fileToUpload.name,
          size: fileToUpload.size,
          type: fileToUpload.type
        });
      } catch (compressionError) {
        console.warn('Compression failed, using original file:', compressionError);
      }

      if (fileToUpload.size === 0) {
        throw new Error('Izbrana slika je prazna. Izberite drugo sliko.');
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileToUpload.size > maxSize) {
        throw new Error('Slika je prevelika. Maksimalna velikost je 10MB.');
      }
    } else {
      if (fileToUpload.byteLength === 0) {
        throw new Error('Izbrana slika je prazna. Izberite drugo sliko.');
      }
    }

    // Upload image to Supabase Storage with retry logic
    console.log('Uploading to Supabase storage...');
    
    const uploadOptions = {
      contentType: Platform.OS === 'web' ? fileToUpload.type : `image/${fileExt}`,
      upsert: false,
      cacheControl: '3600'
    };

    console.log('Upload options:', uploadOptions);

    // Retry upload up to 3 times
    let uploadData, uploadError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Upload attempt ${attempt}/${maxRetries}`);
      
      try {
        const result = await supabase.storage
          .from('posts')
          .upload(fileName, fileToUpload, uploadOptions);
        
        uploadData = result.data;
        uploadError = result.error;
        
        if (!uploadError) {
          console.log('Upload successful on attempt', attempt);
          break;
        } else {
          console.log('Upload failed on attempt', attempt, ':', uploadError);
          if (attempt === maxRetries) {
            throw uploadError;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      } catch (networkError) {
        console.error(`Network error on attempt ${attempt}:`, networkError);
        if (attempt === maxRetries) {
          throw new Error('Napaka pri povezavi s strežnikom. Preverite internetno povezavo in poskusite znova.');
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    if (uploadError) {
      console.error('Final upload error:', uploadError);
      
      if (uploadError.message.includes('Failed to fetch') || 
          uploadError.message.includes('ERR_CONNECTION_RESET') ||
          uploadError.message.includes('Network')) {
        throw new Error('Napaka pri povezavi s strežnikom. Preverite internetno povezavo in poskusite znova.');
      } else if (uploadError.message.includes('file size') || 
                 uploadError.message.includes('too large')) {
        throw new Error('Slika je prevelika. Izberite manjšo sliko.');
      } else if (uploadError.message.includes('permission') || 
                 uploadError.message.includes('policy')) {
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
    
    if (error.message.includes('povezavi') || 
        error.message.includes('Network') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('ERR_CONNECTION_RESET')) {
      errorMessage = 'Napaka pri internetni povezavi. Preverite povezavo in poskusite znova.';
    } else if (error.message.includes('prevelika') || 
               error.message.includes('size') ||
               error.message.includes('10MB')) {
      errorMessage = 'Slika je prevelika. Izberite manjšo sliko ali počakajte, da se kompresira.';
    } else if (error.message.includes('dovoljenja') || 
               error.message.includes('permission')) {
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