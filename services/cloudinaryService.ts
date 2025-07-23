// services/cloudinaryService.ts

export async function uploadImageToCloudinary(uri: string): Promise<string> {
  const data = new FormData();
  data.append('file', {
    uri,
    name: 'profile.jpg',
    type: 'image/jpeg',
  } as any);
  data.append('upload_preset', 'bridgea_users'); // cambia esto si tu preset es otro

  const response = await fetch('https://api.cloudinary.com/v1_1/dqph2qm49/image/upload', {
    method: 'POST',
    body: data,
  });

  const result = await response.json();
  return result.secure_url;
}
