import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Bridge, CreateBridgeInput } from '@/types';

export const useBridges = (page: number = 1) => {
  return useQuery({
    queryKey: ['bridges', page],
    queryFn: async () => {
      const response = await apiService.getFeed(page, 20);
      return response.data || [];
    },
  });
};

export const useCreateBridge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateBridgeInput) => {
      const response = await apiService.createBridge(data);
      return response.bridge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
    },
  });
};

export const useLikeBridge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bridgeId: string) => {
      await apiService.likeBridge(bridgeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
    },
  });
};

export const useUnlikeBridge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bridgeId: string) => {
      await apiService.unlikeBridge(bridgeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
    },
  });
};

export const useGetBridge = (bridgeId: string) => {
  return useQuery({
    queryKey: ['bridge', bridgeId],
    queryFn: async () => {
      const response = await apiService.getBridge(bridgeId);
      return response.bridge;
    },
    enabled: !!bridgeId,
  });
};

export const useGetUserBridges = (username: string) => {
  return useQuery({
    queryKey: ['user-bridges', username],
    queryFn: async () => {
      const response = await apiService.getUserBridges(username);
      return response.bridges;
    },
    enabled: !!username,
  });
};