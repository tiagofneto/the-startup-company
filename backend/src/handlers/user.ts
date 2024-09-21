import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.sendStatus(200);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}