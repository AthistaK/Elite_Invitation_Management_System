import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { logActivity } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendPushNotificationToUser } from '../utils/pushService';

// Check if Chairman account exists in DB
export async function getBootstrapStatus(req: Request, res: Response): Promise<void> {
  try {
    const chairman = await prisma.user.findFirst({
      where: { role: 'CHAIRMAN' },
    });
    res.json({ chairmanExists: !!chairman });
  } catch (error) {
    res.status(500).json({ error: 'Database check failed.' });
  }
}

// First-time Chairman Setup
export async function createChairman(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    // STRICT CHECK: Backend rule - ONLY ONE Chairman can exist
    const existingChairman = await prisma.user.findFirst({
      where: { role: 'CHAIRMAN' },
    });

    if (existingChairman) {
      res.status(400).json({
        error: 'Chairman account already exists. Only one Chairman is allowed in the system.',
      });
      return;
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingEmail) {
      res.status(400).json({ error: 'Email is already registered.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const chairman = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'CHAIRMAN',
        accountStatus: 'APPROVED',
      },
    });

    await logActivity(
      chairman.id,
      'CHAIRMAN_BOOTSTRAPPED',
      `Chairman account created for ${chairman.fullName}`,
      'User',
      chairman.id
    );

    res.status(201).json({
      message: 'Chairman account created successfully.',
      user: {
        id: chairman.id,
        fullName: chairman.fullName,
        email: chairman.email,
        role: chairman.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create Chairman account.' });
  }
}

// Chairman Login
export async function loginChairman(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.role !== 'CHAIRMAN') {
      res.status(401).json({ error: 'Invalid Chairman credentials.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid Chairman credentials.' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    await logActivity(
      user.id,
      'CHAIRMAN_LOGIN',
      `Chairman ${user.fullName} logged in successfully.`,
      'User',
      user.id
    );

    res.json({
      message: 'Chairman login successful.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed.' });
  }
}

// Management Registration (Self Registration)
export async function registerManagement(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      res.status(400).json({ error: 'Full Name, Email, and Passwords are required.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      res.status(400).json({ error: 'Email address is already registered.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Default status: PENDING, default role: OFFICE
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'OFFICE',
        accountStatus: 'PENDING',
      },
    });

    // Notify Chairman
    const chairman = await prisma.user.findFirst({ where: { role: 'CHAIRMAN' } });
    if (chairman) {
      const message = `${user.fullName} (${user.email}) registered as a Management Member and is awaiting approval.`;
      await prisma.notification.create({
        data: {
          userId: chairman.id,
          type: 'MANAGEMENT_REGISTRATION',
          title: 'New Member Registration',
          message,
          relatedEntity: 'User',
          relatedEntityId: user.id,
        },
      });

      await sendPushNotificationToUser(chairman.id, {
        title: 'New Member Registration',
        message,
        url: '/chairman/pending-requests',
      });
    }

    await logActivity(
      user.id,
      'MANAGEMENT_REGISTERED',
      `Management user ${user.fullName} registered (Status: PENDING)`,
      'User',
      user.id
    );

    res.status(201).json({
      message: 'Registration submitted successfully. Your account is waiting for Chairman approval.',
      status: 'PENDING',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed.' });
  }
}

// Management Login
export async function loginManagement(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.role === 'CHAIRMAN') {
      res.status(401).json({ error: 'Invalid Management credentials.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid Management credentials.' });
      return;
    }

    // STRICT ACCOUNT STATUS CHECKS
    if (user.accountStatus === 'PENDING') {
      res.status(403).json({
        error: 'Your account registration is pending Chairman approval.',
        accountStatus: 'PENDING',
      });
      return;
    }

    if (user.accountStatus === 'REJECTED') {
      res.status(403).json({
        error: 'Your account registration request was rejected by the Chairman.',
        accountStatus: 'REJECTED',
      });
      return;
    }

    if (user.accountStatus === 'INACTIVE') {
      res.status(403).json({
        error: 'Your account has been deactivated. Please contact the Chairman.',
        accountStatus: 'INACTIVE',
      });
      return;
    }

    if (user.accountStatus !== 'APPROVED') {
      res.status(403).json({ error: 'Account access denied.' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    await logActivity(
      user.id,
      'MANAGEMENT_LOGIN',
      `Management member ${user.fullName} logged in successfully.`,
      'User',
      user.id
    );

    res.json({
      message: 'Management login successful.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed.' });
  }
}

// Get Current User Profile & Validate Token
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json({ user: req.user });
}

// Logout
export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (req.user) {
    await logActivity(
      req.user.id,
      'USER_LOGOUT',
      `${req.user.fullName} logged out.`,
      'User',
      req.user.id
    );
  }
  res.json({ message: 'Logged out successfully.' });
}
