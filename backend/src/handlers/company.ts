import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { AuthenticatedRequest } from '../middleware.js';
import { createCompanyUser, createUserCompany, fetchCompany, getCompanies, uploadCompany } from '../interactions.js';
import { createCompany, getCompany } from '../aztec.js';
import { fetchCompanyPeople } from '../interactions.js';

export const getCompanyHandler = async (req: Request, res: Response) => {
  try {
    const { handle } = req.query;
    
    if (!handle) {
      return res.status(400).json({ error: 'Missing company handle' });
    }

    //const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    //const { companyRegistry } = addresses;

    //const company = await getCompany(companyRegistry, handle as string);
    const company = await fetchCompany(handle as string);
    
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

    //const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    //const { companyRegistry } = addresses;

    const company = { name, handle, email, director, totalShares };

    // Onchain
    //const tx = await createCompany(companyRegistry, company);
    // Offchain
    const company_id = await uploadCompany(company);
    await createUserCompany(user_id, company_id);

    //res.status(201).json(tx);
    res.status(201).json(company_id);
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
    const people = (await fetchCompanyPeople(handle as string)).map((person) => {
      const metadata = person.raw_user_meta_data as { full_name: string, picture: string };
      return {
        email: person.email,
        name: metadata?.full_name,
        picture: metadata?.picture
      }
    });
    res.status(200).json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({ error: 'Failed to fetch people' });
  }
}

export const createCompanyUserHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, company_id } = req.body;

    // TODO: check if user has permission to add people
    const user_id = req.user.sub;

    await createCompanyUser(email, company_id);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}