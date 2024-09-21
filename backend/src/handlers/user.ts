import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware.js';
import { createOrGetUser } from '../interactions.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await createOrGetUser(req.user.sub);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}