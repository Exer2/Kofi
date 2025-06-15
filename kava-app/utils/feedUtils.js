import { Alert } from 'react-native';
import { supabase } from '../backend/supabase';

export const toggleLike = async ({
  postId,
  currentUser,
  likedPosts,
  setLikedPosts,
  setPosts,
  setError
}) => {
  if (!currentUser) {
    Alert.alert('Napaka', 'Morate biti prijavljeni za všečkanje objav.');
    return;
  }

  const isLiked = likedPosts[postId];
  
  // Optimistic update - posodobi UI takoj
  setLikedPosts(prev => ({
    ...prev,
    [postId]: !isLiked
  }));
  
  // Tudi optimistic update za count
  setPosts(prevPosts => 
    prevPosts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likeCount: (post.likeCount || 0) + (!isLiked ? 1 : -1)
          }
        : post
    )
  );

  try {
    if (isLiked) {
      // Remove like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      console.log('Like removed for post:', postId);
    } else {
      // Add like
      const { error } = await supabase
        .from('likes')
        .insert([{
          post_id: postId,
          user_id: currentUser.id
        }]);

      if (error) throw error;
      console.log('Like added for post:', postId);
    }
  } catch (err) {
    console.error('Error toggling like:', err);
    
    // Revert optimistic update on error
    setLikedPosts(prev => ({
      ...prev,
      [postId]: isLiked // Revert to original state
    }));
    
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likeCount: (post.likeCount || 0) - (!isLiked ? 1 : -1) // Revert count
            }
          : post
      )
    );
    
    Alert.alert('Napaka', 'Napaka pri všečkanju objave.');
  }
};

export const handleCommentSubmit = async ({
  commentText,
  selectedPostForComment,
  setCommentText,
  fetchComments,
  fetchPosts
}) => {
  if (!commentText.trim() || !selectedPostForComment) {
    return;
  }
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const { error: commentError } = await supabase
      .from('comments')
      .insert([
        {
          post_id: selectedPostForComment,
          user_id: user.id,
          username: profileData.username,
          content: commentText.trim()
        }
      ]);

    if (commentError) throw commentError;

    // Clear comment input
    setCommentText('');
    
    // Refresh comments for this post
    fetchComments(selectedPostForComment);
    
    // Refresh posts to update comment count
    fetchPosts();

  } catch (err) {
    console.error('Error adding comment:', err);
    Alert.alert('Napaka', 'Napaka pri dodajanju komentarja.');
  }
};

export const deleteComment = async ({
  commentId,
  postId,
  currentUser,
  setComments,
  fetchComments, 
  fetchPosts     
}) => {
  if (!currentUser) {
    Alert.alert('Napaka', 'Morate biti prijavljeni.');
    return;
  }

  try {
    console.log('Attempting to delete comment:', commentId, 'from post:', postId);
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    console.log('Comment deleted successfully');

    // Update local state immediately
    setComments(prevComments => ({
      ...prevComments,
      [postId]: prevComments[postId]?.filter(comment => comment.id !== commentId) || []
    }));

    // Also refresh data from server for consistency
    if (fetchComments) {
      fetchComments(postId);
    }
    
    if (fetchPosts) {
      fetchPosts(); // Update comment counts
    }

    Alert.alert('Uspeh', 'Komentar je bil izbrisan.');
  } catch (err) {
    console.error('Error deleting comment:', err);
    Alert.alert('Napaka', `Napaka pri brisanju komentarja: ${err.message}`);
  }
};