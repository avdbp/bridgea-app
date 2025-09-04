// Test simple para verificar Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dqph2qm49';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned';

console.log('Testing Cloudinary connection...');
console.log('Cloud Name:', CLOUDINARY_CLOUD_NAME);
console.log('Upload Preset:', CLOUDINARY_UPLOAD_PRESET);

// Test de la URL de Cloudinary
const testUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
console.log('Test URL:', testUrl);

// Verificar si el preset existe
fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    upload_preset: CLOUDINARY_UPLOAD_PRESET,
    public_id: 'test_connection'
  })
})
.then(response => {
  console.log('Response status:', response.status);
  return response.text();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Error:', error);
});
