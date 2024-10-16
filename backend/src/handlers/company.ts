import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { AuthenticatedRequest } from '../middleware.js';
import { authorizeUser, createCompany, fundCompany, getCompany, getCompanyBalance } from '../aztec.js';
import {
  createCompanyUser,
  createUserCompany,
  fetchCompanyPeople,
  fetchUserCompanies,
  getCompanies,
  getCompanyId,
  uploadCompany
} from '../interactions/company.js';
import { transport } from '../utils.js';

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

export const createCompanyHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, handle, description, totalShares } = req.body;
    const user_id = req.user.sub;

    if (!name || !handle || !description || !totalShares) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const company = {
      name,
      handle,
      description,
      email: req.user.email,
      director: req.user.user_metadata?.full_name || '',
      totalShares
    };

    // Onchain
    const tx = await createCompany(companyRegistry, company);
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

export const getUserCompanies = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.user.sub;
    const companies = await fetchUserCompanies(id);
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching user companies:', error);
    res.status(500).json({ error: 'Failed to fetch user companies' });
  }
};

export const getPeopleHandler = async (req: Request, res: Response) => {
  try {
    const { handle } = req.query;
    const people = (await fetchCompanyPeople(handle as string)).map(
      (person) => {
        const metadata = person.raw_user_meta_data as {
          full_name: string;
          picture: string;
        };
        return {
          id: person.id,
          email: person.email,
          kyc_verified: person.kyc_verified,
          name: metadata?.full_name,
          picture: metadata?.picture
        };
      }
    );
    res.status(200).json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({ error: 'Failed to fetch people' });
  }
};

export const createCompanyUserHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { email, handle } = req.body;

    // TODO: check if user has permission to add people
    const user_id = req.user.sub;

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;
    await authorizeUser(companyRegistry, handle, email);

    const company_id = await getCompanyId(handle);
    await createCompanyUser(email, company_id);

    console.log('Sending email to', email);
    try {
      const info = await transport.sendMail({
        from: 'demo@sark.company',
        to: email,
        subject: 'You have been invited to join an INC',
        text: `You have been invited to join the INC @${handle}!`,
        html: `<p>You have been invited to join the INC @${handle}!</p>`
      });
      console.log('Email sent', info);
    } catch (error) {
      console.error('Error sending email:', error);
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getCompanyBalanceHandler = async (req: Request, res: Response) => {
  try {
    const { handle } = req.query;

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const balance = await getCompanyBalance(companyRegistry, handle as string);
    res.status(200).json({ balance: balance.toString() });
  } catch (error) {
    console.error('Error fetching company balance:', error);
    res.status(500).json({ error: 'Failed to fetch company balance' });
  }
};

export const fundCompanyHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { handle, amount } = req.body;

    const user_id = req.user.sub;

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;
    await fundCompany(companyRegistry, handle, user_id, amount);

    res.status(200).json({ message: 'Company funded successfully' });
  } catch (error) {
    console.error('Error funding company:', error);
    res.status(500).json({ error: 'Failed to fund company' });
  }
};
