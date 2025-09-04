import { connectDB } from '../utils/database';
import { User } from '../models/User';
import { Bridge } from '../models/Bridge';
import { Follow } from '../models/Follow';
import { Like } from '../models/Like';
import { Comment } from '../models/Comment';
import { Group } from '../models/Group';

const sampleUsers = [
  {
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@example.com',
    username: 'anagarcia',
    password: 'password123',
    location: 'Madrid, España',
    bio: 'Desarrolladora y amante de la tecnología 📱',
    isPrivate: false,
  },
  {
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos@example.com',
    username: 'carloslopez',
    password: 'password123',
    location: 'Barcelona, España',
    bio: 'Fotógrafo y viajero 🌍',
    isPrivate: false,
  },
  {
    firstName: 'María',
    lastName: 'Rodríguez',
    email: 'maria@example.com',
    username: 'mariarodriguez',
    password: 'password123',
    location: 'Valencia, España',
    bio: 'Artista y diseñadora 🎨',
    isPrivate: true,
  },
  {
    firstName: 'David',
    lastName: 'Martín',
    email: 'david@example.com',
    username: 'davidmartin',
    password: 'password123',
    location: 'Sevilla, España',
    bio: 'Músico y compositor 🎵',
    isPrivate: false,
  },
];

const sampleBridges = [
  {
    content: '¡Qué día tan hermoso en Madrid! 🌞 #madrid #sunnyday',
    tags: ['madrid', 'sunnyday'],
    visibility: 'public' as const,
  },
  {
    content: 'Nueva foto desde Barcelona. La arquitectura de Gaudí nunca deja de impresionarme 🏛️',
    tags: ['barcelona', 'gaudi', 'architecture'],
    visibility: 'public' as const,
  },
  {
    content: 'Trabajando en mi nuevo proyecto artístico. ¿Qué opináis? 🎨',
    tags: ['art', 'project', 'creative'],
    visibility: 'public' as const,
  },
  {
    content: 'Concierto increíble esta noche. La música nos une a todos 🎵',
    tags: ['music', 'concert', 'live'],
    visibility: 'public' as const,
  },
  {
    content: 'Paseo matutino por el parque. La naturaleza es mi inspiración 🌿',
    tags: ['nature', 'morning', 'walk'],
    visibility: 'public' as const,
  },
];

const sampleGroups = [
  {
    name: 'Desarrolladores Madrid',
    description: 'Grupo para desarrolladores en Madrid. Compartimos proyectos, eventos y conocimientos.',
    isPrivate: false,
  },
  {
    name: 'Fotógrafos Barcelona',
    description: 'Comunidad de fotógrafos en Barcelona. Salidas fotográficas y concursos.',
    isPrivate: false,
  },
  {
    name: 'Artistas Valencia',
    description: 'Grupo privado para artistas locales. Exposiciones y colaboraciones.',
    isPrivate: true,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Bridge.deleteMany({});
    await Follow.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});
    await Group.deleteMany({});
    
    // Create users
    console.log('👥 Creating users...');
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`✅ Created user: ${user.username}`);
    }
    
    // Create follows
    console.log('👥 Creating follow relationships...');
    const follows = [];
    
    // Ana follows Carlos and David
    follows.push(new Follow({
      follower: users[0]._id,
      following: users[1]._id,
      status: 'approved',
    }));
    follows.push(new Follow({
      follower: users[0]._id,
      following: users[3]._id,
      status: 'approved',
    }));
    
    // Carlos follows Ana and María
    follows.push(new Follow({
      follower: users[1]._id,
      following: users[0]._id,
      status: 'approved',
    }));
    follows.push(new Follow({
      follower: users[1]._id,
      following: users[2]._id,
      status: 'pending', // María is private
    }));
    
    // David follows everyone
    for (let i = 0; i < users.length; i++) {
      if (i !== 3) { // Don't follow himself
        follows.push(new Follow({
          follower: users[3]._id,
          following: users[i]._id,
          status: users[i].isPrivate ? 'pending' : 'approved',
        }));
      }
    }
    
    for (const follow of follows) {
      await follow.save();
    }
    console.log(`✅ Created ${follows.length} follow relationships`);
    
    // Create bridges
    console.log('🌉 Creating bridges...');
    const bridges = [];
    for (let i = 0; i < sampleBridges.length; i++) {
      const bridgeData = sampleBridges[i];
      const bridge = new Bridge({
        ...bridgeData,
        author: users[i]._id,
      });
      await bridge.save();
      bridges.push(bridge);
      console.log(`✅ Created bridge by ${users[i].username}`);
    }
    
    // Create likes
    console.log('❤️ Creating likes...');
    const likes = [];
    
    // Ana likes Carlos's bridge
    likes.push(new Like({
      user: users[0]._id,
      bridge: bridges[1]._id,
    }));
    
    // Carlos likes Ana's bridge
    likes.push(new Like({
      user: users[1]._id,
      bridge: bridges[0]._id,
    }));
    
    // David likes all bridges
    for (const bridge of bridges) {
      likes.push(new Like({
        user: users[3]._id,
        bridge: bridge._id,
      }));
    }
    
    for (const like of likes) {
      await like.save();
    }
    console.log(`✅ Created ${likes.length} likes`);
    
    // Create comments
    console.log('💬 Creating comments...');
    const comments = [];
    
    // Comment on Ana's bridge
    comments.push(new Comment({
      user: users[1]._id,
      bridge: bridges[0]._id,
      content: '¡Qué día tan bonito! 😊',
    }));
    
    // Comment on Carlos's bridge
    comments.push(new Comment({
      user: users[0]._id,
      bridge: bridges[1]._id,
      content: 'Increíble foto, Carlos! 📸',
    }));
    
    // Comment on María's bridge
    comments.push(new Comment({
      user: users[3]._id,
      bridge: bridges[2]._id,
      content: 'Me encanta tu arte, María! 🎨',
    }));
    
    for (const comment of comments) {
      await comment.save();
    }
    console.log(`✅ Created ${comments.length} comments`);
    
    // Create groups
    console.log('👥 Creating groups...');
    const groups = [];
    for (let i = 0; i < sampleGroups.length; i++) {
      const groupData = sampleGroups[i];
      const group = new Group({
        ...groupData,
        creator: users[i]._id,
        admins: [users[i]._id],
        members: [users[i]._id],
      });
      await group.save();
      groups.push(group);
      console.log(`✅ Created group: ${group.name}`);
    }
    
    // Add members to groups
    console.log('👥 Adding members to groups...');
    
    // Add Carlos to Desarrolladores Madrid
    groups[0].members.push(users[1]._id);
    await groups[0].save();
    
    // Add Ana to Fotógrafos Barcelona
    groups[1].members.push(users[0]._id);
    await groups[1].save();
    
    console.log('✅ Added members to groups');
    
    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${users.length} users created`);
    console.log(`- ${follows.length} follow relationships created`);
    console.log(`- ${bridges.length} bridges created`);
    console.log(`- ${likes.length} likes created`);
    console.log(`- ${comments.length} comments created`);
    console.log(`- ${groups.length} groups created`);
    
    console.log('\n🔑 Test accounts:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - password: password123`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();


