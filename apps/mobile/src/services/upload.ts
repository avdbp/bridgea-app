import { apiService } from './api';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  duration?: number;
}

export const uploadToServer = async (
  uri: string,
  type: 'image' | 'video' = 'image',
  uploadType: 'bridge' | 'profile' = 'bridge'
): Promise<UploadResult> => {
  const formData = new FormData();
  
  const file = {
    uri,
    type: type === 'image' ? 'image/jpeg' : 'video/mp4',
    name: `bridge_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`,
  };
  
  formData.append('file', file as any);
  formData.append('type', type);

  const token = apiService.getToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
        'x-upload-type': uploadType,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server upload failed:', errorText);
      throw new Error(`Server upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Server upload success:', result);
    
    return {
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      duration: result.duration,
    };
  } catch (error) {
    console.error('Error uploading to server:', error);
    throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const uploadMultipleToServer = async (
  mediaItems: Array<{ uri: string; type: 'image' | 'video' }>,
  uploadType: 'bridge' | 'profile' = 'bridge'
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = mediaItems.map(item => 
      uploadToServer(item.uri, item.type, uploadType)
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files to server:', error);
    throw new Error('Failed to upload media files');
  }
};
