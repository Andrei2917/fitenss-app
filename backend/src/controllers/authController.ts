import 'dotenv/config';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database'; 

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// ==========================================
// REGISTER A NEW USER
// ==========================================
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists with this email.' });
      return;
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 4. Generate a login token
    const token = jwt.sign({ id: newUser.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, profilePictureUrl: newUser.profilePictureUrl }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// ==========================================
// LOGIN A USER
// ==========================================
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'Invalid email or password.' });
      return;
    }

    // 2. Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    // 3. Generate a login token
    const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, profilePictureUrl: user.profilePictureUrl }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// ==========================================
// REGISTER A NEW COACH
// ==========================================
export const registerCoach = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, specialty, bio } = req.body;

    // 1. Check if coach already exists
    const existingCoach = await prisma.coach.findUnique({ where: { email } });
    if (existingCoach) {
      res.status(400).json({ error: 'A coach already exists with this email.' });
      return;
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the coach in the database
    const newCoach = await prisma.coach.create({
      data: {
        name,
        email,
        password: hashedPassword,
        specialty: specialty || null,
        bio: bio || null,
      },
    });

    // 4. Generate a login token (Notice the role is 'coach' here)
    const token = jwt.sign({ id: newCoach.id, role: 'coach' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Coach registered successfully',
      token,
      coach: { id: newCoach.id, name: newCoach.name, email: newCoach.email, specialty: newCoach.specialty, profilePictureUrl: newCoach.profilePictureUrl }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during coach registration.' });
  }
};

// ==========================================
// LOGIN A COACH
// ==========================================
export const loginCoach = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const coach = await prisma.coach.findUnique({ where: { email } });
    if (!coach) {
      res.status(404).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, coach.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ id: coach.id, role: 'coach' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Coach login successful',
      token,
      coach: { id: coach.id, name: coach.name, email: coach.email, profilePictureUrl: coach.profilePictureUrl }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during coach login.' });
  }
};