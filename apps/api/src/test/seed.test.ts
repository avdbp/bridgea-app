import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { connectDB } from '../utils/database';
import { User } from '../models/User';
import { Bridge } from '../models/Bridge';
import { Follow } from '../models/Follow';
import { Like } from '../models/Like';
import { Comment } from '../models/Comment';
import { Notification } from '../models/Notification';
import { Group } from '../models/Group';
import { Message } from '../models/Message';

describe('Seed Data', () => {
  beforeEach(async () => {
    // Connect to test database
    await connectDB();
    
    // Clear test data
    await User.deleteMany({});
    await Bridge.deleteMany({});
    await Follow.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Group.deleteMany({});
    await Message.deleteMany({});
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Bridge.deleteMany({});
    await Follow.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Group.deleteMany({});
    await Message.deleteMany({});
  });

  it('should create sample users', async () => {
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

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
    }

    const users = await User.find({});
    expect(users).toHaveLength(4);
    
    expect(users[0].username).toBe('anagarcia');
    expect(users[1].username).toBe('carloslopez');
    expect(users[2].username).toBe('mariarodriguez');
    expect(users[3].username).toBe('davidmartin');
  });

  it('should create sample bridges', async () => {
    // First create a user
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      location: 'Test City',
      password: 'password123',
    });
    await user.save();

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

    for (const bridgeData of sampleBridges) {
      const bridge = new Bridge({
        ...bridgeData,
        author: user._id,
      });
      await bridge.save();
    }

    const bridges = await Bridge.find({});
    expect(bridges).toHaveLength(5);
    
    expect(bridges[0].content).toContain('Madrid');
    expect(bridges[1].content).toContain('Barcelona');
    expect(bridges[2].content).toContain('artístico');
    expect(bridges[3].content).toContain('Concierto');
    expect(bridges[4].content).toContain('parque');
  });

  it('should create sample groups', async () => {
    // First create a user
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      location: 'Test City',
      password: 'password123',
    });
    await user.save();

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

    for (const groupData of sampleGroups) {
      const group = new Group({
        ...groupData,
        creator: user._id,
        admins: [user._id],
        members: [user._id],
      });
      await group.save();
    }

    const groups = await Group.find({});
    expect(groups).toHaveLength(3);
    
    expect(groups[0].name).toBe('Desarrolladores Madrid');
    expect(groups[1].name).toBe('Fotógrafos Barcelona');
    expect(groups[2].name).toBe('Artistas Valencia');
  });

  it('should create sample follow relationships', async () => {
    // Create two users
    const user1 = new User({
      firstName: 'User',
      lastName: 'One',
      email: 'user1@example.com',
      username: 'user1',
      location: 'Test City',
      password: 'password123',
    });
    await user1.save();

    const user2 = new User({
      firstName: 'User',
      lastName: 'Two',
      email: 'user2@example.com',
      username: 'user2',
      location: 'Test City',
      password: 'password123',
    });
    await user2.save();

    // Create follow relationship
    const follow = new Follow({
      follower: user1._id,
      following: user2._id,
      status: 'approved',
    });
    await follow.save();

    const follows = await Follow.find({});
    expect(follows).toHaveLength(1);
    
    expect(follows[0].follower.toString()).toBe(user1._id.toString());
    expect(follows[0].following.toString()).toBe(user2._id.toString());
    expect(follows[0].status).toBe('approved');
  });

  it('should create sample likes', async () => {
    // Create user and bridge
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      location: 'Test City',
      password: 'password123',
    });
    await user.save();

    const bridge = new Bridge({
      author: user._id,
      content: 'This is a test bridge',
      visibility: 'public',
    });
    await bridge.save();

    // Create like
    const like = new Like({
      user: user._id,
      bridge: bridge._id,
    });
    await like.save();

    const likes = await Like.find({});
    expect(likes).toHaveLength(1);
    
    expect(likes[0].user.toString()).toBe(user._id.toString());
    expect(likes[0].bridge.toString()).toBe(bridge._id.toString());
  });

  it('should create sample comments', async () => {
    // Create user and bridge
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      location: 'Test City',
      password: 'password123',
    });
    await user.save();

    const bridge = new Bridge({
      author: user._id,
      content: 'This is a test bridge',
      visibility: 'public',
    });
    await bridge.save();

    // Create comment
    const comment = new Comment({
      user: user._id,
      bridge: bridge._id,
      content: 'This is a test comment',
    });
    await comment.save();

    const comments = await Comment.find({});
    expect(comments).toHaveLength(1);
    
    expect(comments[0].user.toString()).toBe(user._id.toString());
    expect(comments[0].bridge.toString()).toBe(bridge._id.toString());
    expect(comments[0].content).toBe('This is a test comment');
  });

  it('should create sample notifications', async () => {
    // Create user
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      location: 'Test City',
      password: 'password123',
    });
    await user.save();

    // Create notification
    const notification = new Notification({
      recipient: user._id,
      type: 'NEW_LIKE',
      title: 'New Like',
      body: 'Someone liked your bridge',
      isRead: false,
    });
    await notification.save();

    const notifications = await Notification.find({});
    expect(notifications).toHaveLength(1);
    
    expect(notifications[0].recipient.toString()).toBe(user._id.toString());
    expect(notifications[0].type).toBe('NEW_LIKE');
    expect(notifications[0].title).toBe('New Like');
    expect(notifications[0].body).toBe('Someone liked your bridge');
    expect(notifications[0].isRead).toBe(false);
  });

  it('should create sample messages', async () => {
    // Create two users
    const user1 = new User({
      firstName: 'User',
      lastName: 'One',
      email: 'user1@example.com',
      username: 'user1',
      location: 'Test City',
      password: 'password123',
    });
    await user1.save();

    const user2 = new User({
      firstName: 'User',
      lastName: 'Two',
      email: 'user2@example.com',
      username: 'user2',
      location: 'Test City',
      password: 'password123',
    });
    await user2.save();

    // Create message
    const message = new Message({
      sender: user1._id,
      recipient: user2._id,
      content: 'Hello, this is a test message',
      isRead: false,
    });
    await message.save();

    const messages = await Message.find({});
    expect(messages).toHaveLength(1);
    
    expect(messages[0].sender.toString()).toBe(user1._id.toString());
    expect(messages[0].recipient.toString()).toBe(user2._id.toString());
    expect(messages[0].content).toBe('Hello, this is a test message');
    expect(messages[0].isRead).toBe(false);
  });
});


