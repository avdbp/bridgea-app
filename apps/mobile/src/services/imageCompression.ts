import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export const compressImage = async (
  uri: string,
  options: CompressionOptions = {}
): Promise<string> => {
  const {
    maxWidth = 1080,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat[format.toUpperCase() as keyof typeof ImageManipulator.SaveFormat],
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

export const compressMultipleImages = async (
  uris: string[],
  options: CompressionOptions = {}
): Promise<string[]> => {
  try {
    const compressedUris = await Promise.all(
      uris.map(uri => compressImage(uri, options))
    );
    return compressedUris;
  } catch (error) {
    console.error('Error compressing multiple images:', error);
    throw new Error('Failed to compress images');
  }
};
