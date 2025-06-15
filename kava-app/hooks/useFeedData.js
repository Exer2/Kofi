import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { supabase } from '../backend/supabase';

export default function useFeedData() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchPosts = async () => {
    try {
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
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfileData(profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
      Alert.alert('Napaka', 'Napaka pri nalaganju komentarjev.');
    } finally {
      setLoadingComments(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      setCurrentUser(data.user);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchPosts();
    } catch (err) {
      console.error('Error refreshing posts:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return {
    posts,
    setPosts,
    error,
    setError,
    refreshing,
    profileData,
    likedPosts,
    setLikedPosts,
    comments,
    setComments,
    currentUser,
    loadingComments,
    fetchPosts,
    fetchUserProfile,
    fetchLikes,
    fetchComments,
    getCurrentUser,
    onRefresh
  };
}