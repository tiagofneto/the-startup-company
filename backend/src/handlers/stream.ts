import { Response } from 'express';
import { readFileSync } from 'fs';
import { AuthenticatedRequest } from '../middleware.js';
import { fetchUserCompanyStreams, fetchUserStreams, uploadStream } from '../interactions/stream.js';

export const createStreamHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user_id, handle, rate } = req.body;

    // TODO: check if user has permission to add streams
    //const user_id = req.user.sub;

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    //Onchain
    //await createStream(companyRegistry, user_id, company_id, rate);
    // Offchain
    await uploadStream(user_id, handle, rate);
    res.status(201).json({ message: 'Stream created successfully' });
  } catch (error) {
    console.error('Error creating stream:', error);
    res.status(500).json({ error: 'Failed to create stream' });
  }
}

export const getUserCompanyStreamsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // TODO: check if user has permission to view streams
    //const user_id = req.user.sub;

    const { handle, user_id } = req.query;
    const streams = await fetchUserCompanyStreams(handle as string, user_id as string);
    res.status(200).json(streams);
  } catch (error) {
    console.error('Error fetching company streams:', error);
    res.status(500).json({ error: 'Failed to fetch company streams' });
  }
}

export const getUserStreams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // TODO: check if user has permission to view streams
    //const id = req.user.sub;

    const user_id = req.query.user_id as string;

    const streams = await fetchUserStreams(user_id);
    res.status(200).json(streams);
  } catch (error) {
    console.error('Error fetching user streams:', error);
    res.status(500).json({ error: 'Failed to fetch user streams' });
  }
}