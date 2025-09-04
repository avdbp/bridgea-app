import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { User } from '@/types';

export const useFollow = (username: string) => {
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState<'pending' | 'approved' | null>(null);

  // Get follow status
  const {
    data: followStatusData,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useQuery({
    queryKey: ['follow-status', username],
    queryFn: () => apiService.getFollowStatus(username),
    enabled: !!username,
  });

  // Follow user mutation
  const followMutation = useMutation({
    mutationFn: () => apiService.followUser(username),
    onSuccess: (data) => {
      setIsFollowing(true);
      setFollowStatus(data.status);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['follow-status', username] });
      queryClient.invalidateQueries({ queryKey: ['user', username] });
      queryClient.invalidateQueries({ queryKey: ['my-following'] });
    },
  });

  // Unfollow user mutation
  const unfollowMutation = useMutation({
    mutationFn: () => apiService.unfollowUser(username),
    onSuccess: () => {
      setIsFollowing(false);
      setFollowStatus(null);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['follow-status', username] });
      queryClient.invalidateQueries({ queryKey: ['user', username] });
      queryClient.invalidateQueries({ queryKey: ['my-following'] });
    },
  });

  // Respond to follow request mutation
  const respondToFollowRequestMutation = useMutation({
    mutationFn: (action: 'accept' | 'reject') => apiService.respondToFollowRequest(username, action),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['follow-status', username] });
      queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-followers'] });
    },
  });

  // Update local state when data changes
  useEffect(() => {
    if (followStatusData) {
      setIsFollowing(followStatusData.isFollowing);
      setFollowStatus(followStatusData.status);
    }
  }, [followStatusData]);

  const follow = () => {
    return followMutation.mutateAsync();
  };

  const unfollow = () => {
    return unfollowMutation.mutateAsync();
  };

  const acceptFollowRequest = () => {
    return respondToFollowRequestMutation.mutateAsync('accept');
  };

  const rejectFollowRequest = () => {
    return respondToFollowRequestMutation.mutateAsync('reject');
  };

  return {
    // State
    isFollowing,
    followStatus,
    isLoadingStatus,
    
    // Loading states
    isFollowingUser: followMutation.isPending,
    isUnfollowingUser: unfollowMutation.isPending,
    isRespondingToRequest: respondToFollowRequestMutation.isPending,
    
    // Errors
    statusError,
    followError: followMutation.error,
    unfollowError: unfollowMutation.error,
    respondError: respondToFollowRequestMutation.error,
    
    // Actions
    follow,
    unfollow,
    acceptFollowRequest,
    rejectFollowRequest,
  };
};

export const useFollowers = (username: string, page = 1, limit = 20) => {
  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    error: followersError,
    refetch: refetchFollowers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuery({
    queryKey: ['followers', username, page],
    queryFn: () => apiService.getUserFollowers(username, page, limit),
    enabled: !!username,
  });

  const loadMoreFollowers = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    followers: followersData?.followers || [],
    pagination: followersData?.pagination,
    isLoadingFollowers,
    followersError,
    hasNextPage,
    isFetchingNextPage,
    loadMoreFollowers,
    refetchFollowers,
  };
};

export const useFollowing = (username: string, page = 1, limit = 20) => {
  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    error: followingError,
    refetch: refetchFollowing,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuery({
    queryKey: ['following', username, page],
    queryFn: () => apiService.getUserFollowing(username, page, limit),
    enabled: !!username,
  });

  const loadMoreFollowing = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    following: followingData?.following || [],
    pagination: followingData?.pagination,
    isLoadingFollowing,
    followingError,
    hasNextPage,
    isFetchingNextPage,
    loadMoreFollowing,
    refetchFollowing,
  };
};

export const useFollowRequests = (page = 1, limit = 20) => {
  const queryClient = useQueryClient();

  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ['follow-requests', page],
    queryFn: () => apiService.getFollowRequests(page, limit),
  });

  // Respond to follow request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: ({ username, action }: { username: string; action: 'accept' | 'reject' }) =>
      apiService.respondToFollowRequest(username, action),
    onSuccess: () => {
      // Invalidate requests list
      queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-followers'] });
    },
  });

  const respondToRequest = (username: string, action: 'accept' | 'reject') => {
    return respondToRequestMutation.mutateAsync({ username, action });
  };

  return {
    requests: requestsData?.requests || [],
    pagination: requestsData?.pagination,
    isLoadingRequests,
    requestsError,
    isRespondingToRequest: respondToRequestMutation.isPending,
    respondError: respondToRequestMutation.error,
    respondToRequest,
    refetchRequests,
  };
};

export const useMyFollowers = (page = 1, limit = 20) => {
  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    error: followersError,
    refetch: refetchFollowers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuery({
    queryKey: ['my-followers', page],
    queryFn: () => apiService.getMyFollowers(page, limit),
  });

  const loadMoreFollowers = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    followers: followersData?.followers || [],
    pagination: followersData?.pagination,
    isLoadingFollowers,
    followersError,
    hasNextPage,
    isFetchingNextPage,
    loadMoreFollowers,
    refetchFollowers,
  };
};

export const useMyFollowing = (page = 1, limit = 20) => {
  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    error: followingError,
    refetch: refetchFollowing,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuery({
    queryKey: ['my-following', page],
    queryFn: () => apiService.getMyFollowing(page, limit),
  });

  const loadMoreFollowing = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    following: followingData?.following || [],
    pagination: followingData?.pagination,
    isLoadingFollowing,
    followingError,
    hasNextPage,
    isFetchingNextPage,
    loadMoreFollowing,
    refetchFollowing,
  };
};


