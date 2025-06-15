import { Platform } from 'react-native';
import { supabase } from '../backend/supabase';

export const setupRealtimeSubscriptions = ({
  setPosts,
  setLikedPosts,
  setComments,
  fetchPosts,
  fetchLikes,
  fetchComments,
  currentUser,
  selectedPostForComment
}) => {
  let postSubscription, likeSubscription, commentSubscription;
  let pollingInterval;
  
  if (Platform.OS === 'web') {
    // Web fallback: Use polling instead of realtime
    console.log('Setting up polling for web platform');
    
    pollingInterval = setInterval(() => {
      console.log('Polling for updates...');
      fetchPosts();
      fetchLikes();
    }, 10000); // Poll every 10 seconds
    
    // Still try realtime but don't rely on it
    try {
      postSubscription = supabase
        .channel('web_posts_channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'posts' }, 
          payload => {
            console.log('Web realtime posts change:', payload);
            fetchPosts();
          }
        )
        .subscribe((status) => {
          console.log('Posts subscription status:', status);
        });
        
      likeSubscription = supabase
        .channel('web_likes_channel')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'likes' },
          async payload => {
            console.log('Web realtime likes change:', payload);
            fetchPosts(); // Refresh entire feed for simplicity
            fetchLikes();
          }
        )
        .subscribe((status) => {
          console.log('Likes subscription status:', status);
        });
        
      commentSubscription = supabase
        .channel('web_comments_channel')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'comments' },
          payload => {
            console.log('Web realtime comments change:', payload);
            fetchPosts(); // Refresh entire feed for simplicity
          }
        )
        .subscribe((status) => {
          console.log('Comments subscription status:', status);
        });
    } catch (error) {
      console.error('Realtime setup failed, using polling only:', error);
    }
    
  } else {
    // Mobile platforms - use realtime as before
    console.log('📱 Setting up realtime subscriptions for mobile platform');
    
    postSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' }, 
        payload => {
          console.log('Posts change detected:', payload);
          fetchPosts();
        }
      )
      .subscribe();
    
    likeSubscription = supabase
      .channel('likes_channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        async payload => {
          console.log('Like change detected:', payload);
          
          const postId = payload.new?.post_id || payload.old?.post_id;
          
          if (!postId) {
            console.log('No postId found in payload, refreshing all posts');
            fetchPosts();
            fetchLikes();
            return;
          }

          try {
            const { count: newLikeCount, error: countError } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', postId);
              
            if (countError) {
              console.error('Error fetching like count:', countError);
              fetchPosts();
              return;
            }

            console.log(`Updated like count for post ${postId}:`, newLikeCount);
            
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.id === postId 
                  ? { ...post, likeCount: newLikeCount }
                  : post
              )
            );

            if (currentUser) {
              const { data: userLikeData, error: userLikeError } = await supabase
                .from('likes')
                .select('*')
                .eq('post_id', postId)
                .eq('user_id', currentUser.id)
                .single();

              if (!userLikeError && userLikeData) {
                setLikedPosts(prev => ({
                  ...prev,
                  [postId]: true
                }));
              } else {
                setLikedPosts(prev => ({
                  ...prev,
                  [postId]: false
                }));
              }
            }
            
          } catch (err) {
            console.error('Error in like subscription handler:', err);
            fetchPosts();
            fetchLikes();
          }
        }
      )
      .subscribe();

    commentSubscription = supabase
      .channel('comments_channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        payload => {
          console.log('Comment change detected:', payload);
          
          const postId = payload.new?.post_id || payload.old?.post_id;
          
          if (!postId) return;

          const fetchCommentCount = async () => {
            try {
              const { count, error } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', postId);
              
              if (error) {
                console.error('Error fetching comment count:', error);
                return;
              }

              setPosts(prevPosts => 
                prevPosts.map(post => 
                  post.id === postId 
                    ? { ...post, commentCount: count }
                    : post
                )
              );
              
              if (selectedPostForComment === postId) {
                fetchComments(postId);
              }
            } catch (err) {
              console.error('Error in fetchCommentCount:', err);
            }
          };
          
          fetchCommentCount();
        }
      )
      .subscribe();
  }

  // Cleanup function
  return () => {
    console.log('🧹 Cleaning up subscriptions and polling');
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    if (postSubscription) postSubscription.unsubscribe();
    if (likeSubscription) likeSubscription.unsubscribe();
    if (commentSubscription) commentSubscription.unsubscribe();
  };
};