import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware.js';
import { createOrGetUser, fetchUserCompanies } from '../interactions.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.user.sub;
    const user = await createOrGetUser(id);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export const getUserCompanies = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.sub;
        const companies = await fetchUserCompanies(id);
        res.status(200).json(companies);
    } catch (error) {
        console.error('Error fetching user companies:', error);
        res.status(500).json({ error: 'Failed to fetch user companies' });
    }
}