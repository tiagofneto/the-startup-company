import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware.js';
import { createOrGetUser, fetchUserCompanies } from '../interactions.js';
//import { OpenPassport1StepInputs, OpenPassport1StepVerifier } from '@openpassport/sdk';


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

export const verifyKyc = async (req: AuthenticatedRequest, res: Response) => {
    try {
        //const id = req.user.sub;
        //const proof = req.body.proof as OpenPassport1StepInputs;

        //const verifierArgs = { scope: "@thestartupcompany", requirements: [], dev_mode: true }
        //const openPassport1StepVerifier = new OpenPassport1StepVerifier(verifierArgs);

        //const isValid = (await openPassport1StepVerifier.verify(proof)).valid;
        //if (!isValid) {
        //    res.status(400).json({ error: 'Invalid proof' });
        //} else {
        //console.log("Passport proof is valid");
        //console.log("Nullifier: ", proof.nullifier);
        //res.sendStatus(200);
        //}

        console.log("Verifying KYC");
        res.sendStatus(501);
    } catch (error) {
        console.error('Error verifying KYC:', error);
        res.status(500).json({ error: 'Failed to verify KYC' });
    }
}