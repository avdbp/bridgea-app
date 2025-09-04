import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../models/User';
import { JWTService } from '../services/jwt';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { 
  registerSchema, 
  loginSchema, 
  changePasswordSchema, 
  forgotPasswordSchema,
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  ForgotPasswordInput
} from '../types/schemas';

export default async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', {
    preHandler: [validateBody(registerSchema)],
  }, async (request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) => {
    try {
      const { firstName, lastName, email, username, location, password } = request.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      
      if (existingUser) {
        return reply.status(400).send({
          error: 'User already exists',
          field: existingUser.email === email ? 'email' : 'username'
        });
      }
      
      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        username,
        location,
        password,
      });
      
      await user.save();
      
      // Generate tokens
      const tokens = JWTService.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      });
      
      return reply.status(201).send({
        message: 'User registered successfully',
        user: user.toJSON(),
        tokens,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Registration failed' });
    }
  });
  
  // Login
  fastify.post('/login', {
    preHandler: [validateBody(loginSchema)],
  }, async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
    try {
      const { emailOrUsername, password } = request.body;
      
      // Find user by email or username
      const user = await User.findOne({
        $or: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername }
        ]
      }).select('+password');
      
      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      
      // Generate tokens
      const tokens = JWTService.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      });
      
      return reply.send({
        message: 'Login successful',
        user: user.toJSON(),
        tokens,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Login failed' });
    }
  });
  
  // Refresh token
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };
      
      if (!refreshToken) {
        return reply.status(401).send({ error: 'Refresh token required' });
      }
      
      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await User.findById(payload.userId);
      if (!user) {
        return reply.status(401).send({ error: 'User not found' });
      }
      
      // Generate new tokens
      const tokens = JWTService.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      });
      
      return reply.send({
        message: 'Tokens refreshed successfully',
        tokens,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }
  });
  
  // Get current user
  fastify.get('/me', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return reply.send({
        user: user.toJSON(),
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get user data' });
    }
  });
  
  // Change password
  fastify.patch('/change-password', {
    preHandler: [authenticate, validateBody(changePasswordSchema)],
  }, async (request: FastifyRequest<{ Body: ChangePasswordInput }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const { currentPassword, newPassword } = request.body;
      
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return reply.status(400).send({ error: 'Current password is incorrect' });
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      return reply.send({
        message: 'Password changed successfully',
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to change password' });
    }
  });
  
  // Forgot password (simulated - just logs for now)
  fastify.post('/forgot-password', {
    preHandler: [validateBody(forgotPasswordSchema)],
  }, async (request: FastifyRequest<{ Body: ForgotPasswordInput }>, reply: FastifyReply) => {
    try {
      const { email } = request.body;
      
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Don't reveal if email exists or not
        return reply.send({
          message: 'If the email exists, a password reset link has been sent',
        });
      }
      
      // TODO: Implement actual email sending
      fastify.log.info(`Password reset requested for email: ${email}`);
      
      return reply.send({
        message: 'If the email exists, a password reset link has been sent',
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to process password reset request' });
    }
  });
  
  // Logout (client-side token removal)
  fastify.post('/logout', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from storage
    return reply.send({
      message: 'Logged out successfully',
    });
  });
}


