import { useState, useEffect, useCallback } from 'react';
import { Platform, Keyboard, LayoutAnimation, UIManager } from 'react-native';
import { supabase } from '../backend/supabase';
import { handleImagePicker, handleUpload } from '../utils/imageUtils';
import { toggleLike, handleCommentSubmit, deleteComment } from '../utils/feedUtils';
import { registerWebPush } from '../utils/webPush';
import { showAlert } from '../utils/alertHelper';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function useFeedData() {
  // Data states
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);

  // Form states
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(3);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Fetch functions
  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          likes:likes(count),
          comments:comments(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const postsWithStats = data.map(post => ({
        ...post,
        likeCount: post.likes[0]?.count || 0,
        commentCount: post.comments[0]?.count || 0
      }));
      
      setPosts(postsWithStats);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Napaka pri nalaganju objav.');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      setCurrentUser(user);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfileData(profile);

      // Registriraj web push, ko vemo, da je user prijavljen
      registerWebPush();
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const likesMap = data.reduce((acc, like) => {
        acc[like.post_id] = true;
        return acc;
      }, {});
      
      setLikedPosts(likesMap);
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setComments(prevComments => ({
        ...prevComments,
        [postId]: data
      }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Handler functions
  const handleAddImage = () => handleImagePicker(setPendingUpload, setIsModalVisible, setError);
  
  const handleUploadWithDetails = () => {
  console.log('handleUploadWithDetails klican');
  handleUpload({
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
  });
  };

  const toggleLikePost = (postId) => toggleLike({
    postId,
    currentUser,
    likedPosts,
    setLikedPosts,
    setPosts,
    setError
  });

  const handleDelete = async (postId, image_url) => {
    console.log('=== ZAČETEK BRISANJA ===');
    console.log('postId:', postId);
    console.log('image_url:', image_url);
    
    try {
      if (!image_url) {
        throw new Error('image_url je prazen ali undefined');
      }

      // Popravljeno: Odstrani query parametre in vzemi samo ime datoteke
      const urlWithoutParams = image_url.split('?')[0];
      const fileName = urlWithoutParams.split('/').pop();
      console.log('fileName ekstraktiran:', fileName);
      
      if (!fileName) {
        throw new Error('fileName je prazen');
      }

      console.log('Brisanje iz baze...');
      const { data: deleteData, error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      console.log('Database response data:', deleteData);
      console.log('Database response error:', deleteError);
      
      if (deleteError) {
        console.error('Database napaka:', deleteError);
        throw deleteError;
      }
      
      console.log('Post uspešno izbrisan iz baze');

      console.log('Brisanje iz storage...');
      const { data: storageData, error: storageError } = await supabase.storage
        .from('posts')
        .remove([fileName]);
      
      console.log('Storage response data:', storageData);
      console.log('Storage response error:', storageError);
      
      if (storageError) {
        console.warn('Storage opozorilo (ni kritično):', storageError);
      } else {
        console.log('Datoteka uspešno izbrisana iz storage');
      }

      setSelectedImage(null);
      setSelectedPost(null);
      await fetchPosts();
      showAlert('Uspeh', 'Objava je bila izbrisana.');
      console.log('=== BRISANJE USPEŠNO ZAKLJUČENO ===');
    } catch (err) {
      console.error('=== NAPAKA PRI BRISANJU ===');
      console.error('Error tip:', err.name);
      console.error('Error sporočilo:', err.message);
      console.error('Celotna napaka:', err);
      showAlert('Napaka', `Napaka pri brisanju objave: ${err.message}`);
    }
  };

  const onRefresh = useCallback(async () => {
    await fetchPosts();
  }, []);

  // Initialize data
  useEffect(() => {
    fetchPosts();
    fetchUserProfile();
    fetchLikes();
  }, []);

  // Keyboard handling
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardVisible(true);
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Return all needed state and functions
  return {
    // Data states
    posts,
    setPosts,
    currentUser,
    setCurrentUser,
    profileData,
    likedPosts,
    setLikedPosts,
    comments,
    setComments,
    refreshing,
    error,
    setError,

    // Modal states
    isModalVisible,
    setIsModalVisible,
    commentModalVisible,
    setCommentModalVisible,
    selectedImage,
    setSelectedImage,
    selectedPost,
    setSelectedPost,
    selectedPostForComment,
    setSelectedPostForComment,

    // Form states
    description,
    setDescription,
    rating,
    setRating,
    pendingUpload,
    setPendingUpload,
    commentText,
    setCommentText,

    // Loading states
    isUploading,
    setIsUploading,
    isImageLoading,
    setIsImageLoading,
    loadingComments,
    setLoadingComments,
    keyboardVisible,
    setKeyboardVisible,

    // Functions
    fetchPosts,
    fetchUserProfile,
    fetchComments,
    fetchLikes,
    handleAddImage,
    handleUploadWithDetails,
    toggleLikePost,
    handleDelete,
    onRefresh
  };
}