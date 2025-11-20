import { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Message from '../models/Message';

async function sendMessage(req: Request, res: Response) {
  // senderId should NOT be provided in the body. It must come from signed JWT in cookie.
  const { recipientId, content } = req.body;

  const token = (req as any).cookies?.token || (req as any).cookies?.jwt;
  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing' });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }

  const senderId = payload?.id || payload?.userId || payload?._id;

  if (!senderId || !recipientId || !content) {
    return res.status(400).json({ message: 'recipientId and content are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
    return res.status(400).json({ message: 'Invalid senderId or recipientId' });
  }

  try {
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
    });

    await message.save();

    return res.status(201).json(message);
  } catch (err) {
    console.error('Failed to send message', err);
    return res.status(500).json({ message: 'Failed to send message' });
  }
}

export default sendMessage;
