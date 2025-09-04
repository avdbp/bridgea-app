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
    onSuccess: (data) => {
      if (data.status === 'approved') {
        setIsFollowing(true);
        setFollowStatus('approved');
      } else {
        setIsFollowing(false);
        setFollowStatus(null);
      }
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['follow-status', username] });
      queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
    },
  });

  // Update local state when data changes
  useEffect(() => {
    if (followStatusData) {
      setIsFollowing(followStatusData.isFollowing);
      setFollowStatus(followStatusData.status);
    }
  }, [followStatusData]);

  return {
    isFollowing,
    followStatus,
    isLoadingStatus,
    statusError,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    respondToFollowRequest: respondToFollowRequestMutation.mutate,
    isFollowingLoading: followMutation.isPending,
    isUnfollowingLoading: unfollowMutation.isPending,
    isRespondingLoading: respondToFollowRequestMutation.isPending,
  };
};

export const useFollowRequests = () => {
  const queryClient = useQueryClient();

  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ['follow-requests'],
    queryFn: () => apiService.getFollowRequests(),
  });

  // Accept follow request mutation
  const acceptFollowRequestMutation = useMutation({
    mutationFn: (userId: string) => apiService.respondToFollowRequest(userId, 'accept'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-followers'] });
    },
  });

  // Reject follow request mutation
  const rejectFollowRequestMutation = useMutation({
    mutationFn: (userId: string) => apiService.respondToFollowRequest(userId, 'reject'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
    },
  });

  return {
    requests: requestsData?.data || [],
    pagination: requestsData?.pagination,
    isLoadingRequests,
    requestsError,
    refetchRequests,
    acceptFollowRequest: acceptFollowRequestMutation.mutate,
    rejectFollowRequest: rejectFollowRequestMutation.mutate,
    isAcceptingLoading: acceptFollowRequestMutation.isPending,
    isRejectingLoading: rejectFollowRequestMutation.isPending,
  };
};

export const useFollowers = (username: string, page = 1, limit = 20) => {
  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    error: followersError,
    refetch: refetchFollowers,
  } = useQuery({
    queryKey: ['followers', username, page],
    queryFn: () => apiService.getUserFollowers(username, page, limit),
    enabled: !!username,
  });

  return {
    followers: followersData?.data || [],
    pagination: followersData?.pagination,
    isLoadingFollowers,
    followersError,
    refetchFollowers,
  };
};

export const useFollowing = (username: string, page = 1, limit = 20) => {
  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    error: followingError,
    refetch: refetchFollowing,
  } = useQuery({
    queryKey: ['following', username, page],
    queryFn: () => apiService.getUserFollowing(username, page, limit),
    enabled: !!username,
  });

  return {
    following: followingData?.data || [],
    pagination: followingData?.pagination,
    isLoadingFollowing,
    followingError,
    refetchFollowing,
  };
};

export const useMyFollowers = (page = 1, limit = 20) => {
  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    error: followersError,
    refetch: refetchFollowers,
  } = useQuery({
    queryKey: ['my-followers', page],
    queryFn: () => apiService.getMyFollowers(page, limit),
  });

  return {
    followers: followersData?.data || [],
    pagination: followersData?.pagination,
    isLoadingFollowers,
    followersError,
    refetchFollowers,
  };
};

export const useMyFollowing = (page = 1, limit = 20) => {
  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    error: followingError,
    refetch: refetchFollowing,
  } = useQuery({
    queryKey: ['my-following', page],
    queryFn: () => apiService.getMyFollowing(page, limit),
  });

  return {
    following: followingData?.data || [],
    pagination: followingData?.pagination,
    isLoadingFollowing,
    followingError,
    refetchFollowing,
  };
};