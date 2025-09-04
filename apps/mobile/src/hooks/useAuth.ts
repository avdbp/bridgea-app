import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiService } from '@/services/api';
import { LoginCredentials, RegisterData, User } from '@/types';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, clearAuth, updateUser, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      console.log('Login mutation called with:', credentials);
      return apiService.login(credentials);
    },
    onSuccess: (data) => {
      console.log('Login mutation success:', data);
      console.log('Calling store login function...');
      login(data.user, data.tokens);
      console.log('Store login function called');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('Login mutation error:', error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) => apiService.register(userData),
    onSuccess: (data) => {
      login(data.user, data.tokens);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('Register error:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      clearAuth();
      queryClient.clear();
    },
  });

  // Get current user query
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => apiService.getCurrentUser(),
    enabled: isAuthenticated,
    select: (data) => data.user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      username: string;
      bio?: string;
      location?: string;
      website?: string;
      isPrivate?: boolean;
      avatar?: string;
      banner?: string;
    }) => apiService.updateProfile(data),
    onSuccess: (data) => {
      updateUser(data.user);
      queryClient.setQueryData(['user', 'current'], { user: data.user });
    },
    onError: (error) => {
      console.error('Update profile error:', error);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => apiService.changePassword(data),
    onError: (error) => {
      console.error('Change password error:', error);
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => apiService.forgotPassword(email),
    onError: (error) => {
      console.error('Forgot password error:', error);
    },
  });

  return {
    // State
    user: currentUser || user,
    isAuthenticated,
    isLoading: loginMutation.isPending || registerMutation.isPending || isLoadingUser,
    
    // Actions
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    
    // Errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    updateProfileError: updateProfileMutation.error,
    changePasswordError: changePasswordMutation.error,
    forgotPasswordError: forgotPasswordMutation.error,
    
    // Success states
    isLoginSuccess: loginMutation.isSuccess,
    isRegisterSuccess: registerMutation.isSuccess,
    isLogoutSuccess: logoutMutation.isSuccess,
    isUpdateProfileSuccess: updateProfileMutation.isSuccess,
    isChangePasswordSuccess: changePasswordMutation.isSuccess,
    isForgotPasswordSuccess: forgotPasswordMutation.isSuccess,
  };
};

