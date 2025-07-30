// Archivo de prueba para verificar configuración de Cloudinary
// Ejecutar con: node test-cloudinary.js

const FormData = require('form-data');
const fs = require('fs');

async function testCloudinaryUpload() {
  try {
    console.log("🧪 Probando configuración de Cloudinary...");
    
    // Crear un archivo de prueba simple
    const testImagePath = './test-image.txt';
    fs.writeFileSync(testImagePath, 'test image content');
    
    const data = new FormData();
    data.append('file', fs.createReadStream(testImagePath));
    data.append('upload_preset', 'bridgea-app');
    
    console.log("📤 Enviando petición de prueba...");
    
    const response = await fetch('https://api.cloudinary.com/v1_1/dqqddecpb/image/upload', {
      method: 'POST',
      body: data
    });
    
    console.log("📡 Status:", response.status);
    console.log("📡 OK:", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error:", errorText);
      return;
    }
    
    const result = await response.json();
    console.log("✅ Respuesta exitosa:", result);
    
    // Limpiar archivo de prueba
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error("❌ Error en prueba:", error);
  }
}

// Ejecutar la prueba
testCloudinaryUpload(); 