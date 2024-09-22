import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { AuthenticatedRequest } from '../middleware.js';
import { createUserCompany, fetchCompany, getCompanies, uploadCompany } from '../interactions.js';
import { createCompany, getCompany } from '../aztec.js';
import { fetchCompanyPeople } from '../interactions.js';

export const getCompanyHandler = async (req: Request, res: Response) => {
  try {
    const { handle } = req.query;
    
    if (!handle) {
      return res.status(400).json({ error: 'Missing company handle' });
    }

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const company = await getCompany(companyRegistry, handle as string);
    //const company = await fetchCompany(handle as string);
    
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};

export const createCompanyHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, handle, email, director, totalShares } = req.body;
    const user_id = req.user.sub;
    
    if (!name || !handle || !email || !director || !totalShares) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const company = { name, handle, email, director, totalShares };

    // Onchain
    const tx = await createCompany(companyRegistry, company);
    // Offchain
    const company_id = await uploadCompany(company);
    await createUserCompany(user_id, company_id);

    res.status(201).json(tx);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
};

export const getCompaniesHandler = async (req: Request, res: Response) => {
  try {
    const companies = await getCompanies();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

export const getPeopleHandler = async (req: Request, res: Response) => {
  try {
    const { handle } = req.query;
    const people = await fetchCompanyPeople(handle as string);
    res.status(200).json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({ error: 'Failed to fetch people' });
  }
}
