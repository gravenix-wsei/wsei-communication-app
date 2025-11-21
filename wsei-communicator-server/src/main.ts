import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { register, login } from './controllers/authController';
import { sendMessage, loadMessages, getAllUsers } from './controllers/messageController';

interface ExtendedSocket extends Socket {
  userId?: string;
}

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wsei_communicator';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const CORS_ORIGINS = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const app = express();
  const httpServer = createServer(app);
  
  const corsOptions = {
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  const io = new Server(httpServer, {
    cors: corsOptions
  });

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser()); // enable reading JWT from cookies

  // Auth routes
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);

  // Message routes
  app.get('/api/users', getAllUsers);
  app.post('/api/messages/send', sendMessage);
  app.get('/api/messages/load', loadMessages);
  app.get('/', (req, res) => {res.status(200).json({ status: 'ok' });});

  // Socket.IO connection handling
  io.on('connection', (socket: ExtendedSocket) => {
    // Try to get token from auth object first, then from Authorization header, then from cookie
    let token = socket.handshake.auth.token;
    
    if (!token) {
      const authHeader = socket.handshake.headers.authorization as string | undefined;
      token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    }
    
    if (!token) {
      token = socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];
    }
    
    if (!token) {
      console.log('Socket connection rejected - no token');
      socket.disconnect();
      return;
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const userId = payload?.id || payload?.userId || payload?._id;
      
      if (!userId) {
        console.log('Socket connection rejected - no userId in token');
        socket.disconnect();
        return;
      }

      socket.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`User ${userId} connected via Socket.IO`);

      socket.on('message:send', async (data) => {
        try {
          console.log('Socket message:send received', data);
          const { recipientId, content } = data;
          if (!recipientId || !content) {
            socket.emit('error', { message: 'recipientId and content are required' });
            return;
          }

          const Message = (await import('./models/Message')).default;
          const message = new Message({
            sender: userId,
            recipient: recipientId,
            content,
            createdAt: new Date()
          });

          await message.save();

          // Emit to recipient
          io.to(`user:${recipientId}`).emit('message:receive', {
            _id: message._id,
            sender: message.sender,
            recipient: message.recipient,
            content: message.content,
            createdAt: message.createdAt
          });

          // Emit confirmation to sender
          socket.emit('message:sent', { _id: message._id });
        } catch (err) {
          console.error('Socket message error', err);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
      });
    } catch (err) {
      console.log('Socket authentication failed', err);
      socket.disconnect();
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((e) => { console.error('Failed to start', e); process.exit(1); });
