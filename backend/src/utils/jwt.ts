import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'eims_super_secret_enterprise_jwt_key_2026';

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
