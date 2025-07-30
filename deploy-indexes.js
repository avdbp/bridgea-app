#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Desplegando índices de Firestore...');

try {
  // Verificar si firebase CLI está instalado
  execSync('firebase --version', { stdio: 'pipe' });
  
  // Desplegar índices
  console.log('📋 Desplegando índices desde firestore.indexes.json...');
  execSync('firebase deploy --only firestore:indexes', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Índices desplegados exitosamente!');
  console.log('⏳ Los índices pueden tardar unos minutos en estar activos.');
  
} catch (error) {
  console.error('❌ Error desplegando índices:', error.message);
  console.log('\n📝 Instrucciones manuales:');
  console.log('1. Instala Firebase CLI: npm install -g firebase-tools');
  console.log('2. Inicia sesión: firebase login');
  console.log('3. Despliega índices: firebase deploy --only firestore:indexes');
  console.log('\n🔗 O crea los índices manualmente en:');
  console.log('https://console.firebase.google.com/project/bridgea-app-fixed/firestore/indexes');
} 