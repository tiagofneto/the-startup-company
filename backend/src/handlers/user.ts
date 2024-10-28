import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware.js';
import {
  OpenPassport1StepInputs,
  OpenPassport1StepVerifier
} from '@openpassport/sdk';
import { createOrGetUser, setKycVerified } from '../interactions/user.js';
import { isUserVerified, verifyUser } from '../aztec.js';
import { readFileSync } from 'fs';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.user.sub;
    const user = await createOrGetUser(id);

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const kyc = await isUserVerified(companyRegistry, id);
    res.status(200).json({ user, kyc });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const verifyKyc = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.user.sub;
    const proof = req.body.proof as OpenPassport1StepInputs;

    console.log('Verifying KYC');

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const verifierArgs = {
      scope: '@thestartupcompany',
      requirements: [],
      dev_mode: true
    };
    const openPassport1StepVerifier = new OpenPassport1StepVerifier(
      verifierArgs
    );

    const isValid = (await openPassport1StepVerifier.verify(proof)).valid;
    if (!isValid) {
      console.log('Passport proof is invalid');
      res.status(400).json({ error: 'Invalid proof' });
    } else {
      console.log('Passport proof is valid');
      // TODO: Store nullifier in database
      //console.log("Nullifier: ", proof.getNullifier());
      await verifyUser(companyRegistry, id);
      await setKycVerified(id);
      res.sendStatus(200);
    }
  } catch (error) {
    console.error('Error verifying KYC:', error);
    res.status(500).json({ error: 'Failed to verify KYC' });
  }
};

export const getKycStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.user.sub;

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const kyc = await isUserVerified(companyRegistry, id);
    res.status(200).json(kyc);
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
};