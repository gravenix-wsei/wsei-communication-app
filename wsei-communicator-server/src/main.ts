import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { register, login } from './controllers/authController';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wsei_communicator';

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json());

  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((e) => { console.error('Failed to start', e); process.exit(1); });
