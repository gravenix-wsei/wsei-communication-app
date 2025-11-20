import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wsei_communicator';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for init');
  try {
    await User.init();
    console.log('Ensured User indexes');
  } catch (err) {
    console.error('Init error', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
