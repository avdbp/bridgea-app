import Constants from 'expo-constants';

const CLOUDINARY_CLOUD_NAME = Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME || 'dqph2qm49';
const CLOUDINARY_API_KEY = Constants.expoConfig?.extra?.CLOUDINARY_API_KEY || '123456789012345';
const CLOUDINARY_API_SECRET = Constants.expoConfig?.extra?.CLOUDINARY_API_SECRET || 'your-secret-key';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  duration?: number;
}

export const uploadToCloudinary = async (
  uri: string,
  type: 'image' | 'video' = 'image'
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  
  // Crear el objeto File para la subida (formato correcto para React Native)
  const file = {
    uri,
    type: type === 'image' ? 'image/jpeg' : 'video/mp4',
    name: `bridge_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`,
  };
  
  formData.append('file', file as any);
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('timestamp', Math.round((new Date()).getTime() / 1000).toString());
  
  if (type === 'video') {
    formData.append('resource_type', 'video');
  }

  // Generar signature (simplificado para testing)
  const timestamp = Math.round((new Date()).getTime() / 1000).toString();
  const signature = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  formData.append('signature', signature);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type === 'video' ? 'video' : 'image'}/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', errorText);
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload success:', result);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      duration: result.duration,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(`Failed to upload media to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const uploadMultipleToCloudinary = async (
  mediaItems: Array<{ uri: string; type: 'image' | 'video' }>
): Promise<CloudinaryUploadResult[]> => {
  try {
    const uploadPromises = mediaItems.map(item => 
      uploadToCloudinary(item.uri, item.type)
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files to Cloudinary:', error);
    throw new Error('Failed to upload media files to Cloudinary');
  }
};