const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuración de Firebase (usar la misma que en la app)
const firebaseConfig = {
  apiKey: "AIzaSyAwjLlYRCdxhy5bA7MlLAzM7WsFwLd6wLY",
  authDomain: "bridgea-app-fixed.firebaseapp.com",
  projectId: "bridgea-app-fixed",
  storageBucket: "bridgea-app-fixed.appspot.com",
  messagingSenderId: "876469848708",
  appId: "1:876469848708:web:141d25e720c785da2210d1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugUsers() {
  try {
    console.log("🔍 Verificando usuarios en la base de datos...");
    
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Total de usuarios encontrados: ${users.length}`);
    
    if (users.length > 0) {
      console.log("👥 Usuarios disponibles:");
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Username: ${user.username || 'No especificado'}`);
        console.log(`   Nombre: ${user.name || 'No especificado'}`);
        console.log(`   Email: ${user.email || 'No especificado'}`);
        console.log("   ---");
      });
    } else {
      console.log("❌ No se encontraron usuarios en la base de datos");
    }
  } catch (error) {
    console.error("❌ Error al verificar usuarios:", error);
  }
}

debugUsers(); 