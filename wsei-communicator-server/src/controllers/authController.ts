import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, passwordConfirm, nickname } = req.body;

    if (!email || !password || !passwordConfirm) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    if (password !== passwordConfirm) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ email, passwordHash, nickname });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, nickname: user.nickname },
      JWT_SECRET as Secret,
      { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] }
    );

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, nickname: user.nickname }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, nickname: user.nickname },
      JWT_SECRET as Secret,
      { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] }
    );

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.json({
      token: token,
      user: { id: user._id, email: user.email, nickname: user.nickname }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
