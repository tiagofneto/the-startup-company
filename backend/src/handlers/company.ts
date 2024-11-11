import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { AuthenticatedRequest } from '../middleware.js';
import {
  authorizeUser,
  createCompany,
  fundCompany,
  getCompany,
  getCompanyBalance,
  getShares,
  issueShares,
  transferTokensToAddress,
  transferTokensToHandle
} from '../aztec.js';
import {
  createCompanyUser,
  createPayment,
  createUserCompany,
  fetchCompanyPeople,
  fetchPayments,
  fetchShareholders,
  fetchUserCompanies,
  getCompanies,
  getCompanyId,
  updateShareholderFunded,
  updateShareholders,
  uploadCompany
} from '../interactions/company.js';
import { transport } from '../utils.js';
import { getUserEmail } from '../interactions/user.js';

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
    const { name, handle, description } = req.body;
    const user_id = req.user.sub;

    if (!name || !handle || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const company = {
      name,
      handle,
      description,
      email: req.user.email,
      director: req.user.user_metadata?.full_name || ''
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
    const companies = (await getCompanies()).map(({ userInfo, ...company }) => ({
      ...company,
      directors: userInfo.map((user) => ({ name: user.raw_user_meta_data?.full_name || user.email, kyc_verified: user.kyc_verified }))
    }));
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

export const fundCompanyHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { handle, amount } = req.body;

    const user_id = req.user.sub;
    const email = await getUserEmail(user_id);
    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const companyId = await getCompanyId(handle);

    await fundCompany(companyRegistry, handle, user_id, amount);

    await updateShareholderFunded(companyId, email);

    res.status(200).json({ message: 'Company funded successfully' });
  } catch (error) {
    console.error('Error funding company:', error);
    res.status(500).json({ error: 'Failed to fund company' });
  }
};

export const getShareholdersHandler = async (req: Request, res: Response) => {
  try {
    const { handle } = req.query;
    const companyId = await getCompanyId(handle as string);
    const shareholders = (await fetchShareholders(companyId)).map(
      (shareholder) => {
        const metadata = shareholder.raw_user_meta_data as {
          full_name: string;
          picture: string;
        };
        return {
          shares: shareholder.shares,
          funded: shareholder.funded,
          email: shareholder.email,
          name: metadata?.full_name,
          picture: metadata?.picture
        };
      }
    );
    res.status(200).json(shareholders);
  } catch (error) {
    console.error('Error fetching shareholders:', error);
    res.status(500).json({ error: 'Failed to fetch shareholders' });
  }
};

export const getSharesHandler = async (req: Request, res: Response) => {
  try {
    const { handle } = req.query;

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const shares = await getShares(companyRegistry, handle as string);
    const shares_obj = {
      minted_shares: shares[0].toString(),
      total_shares: shares[1].toString()
    };
    res.status(200).json(shares_obj);
  } catch (error) {
    console.error('Error fetching shares:', error);
    res.status(500).json({ error: 'Failed to fetch shares' });
  }
};

export const issueSharesHandler = async (req: Request, res: Response) => {
  try {
    const { handle, shares, splits } = req.body;

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const companyId = await getCompanyId(handle);

    await issueShares(companyRegistry, handle, shares);

    // TODO all in one query
    for (const split of splits) {
      const user_shares = Math.floor((shares * split.equity) / 100);
      console.log('Updating shareholder:', split.email, user_shares);
      await updateShareholders(companyId, split.email, user_shares);
    }

    res.status(200).json({ message: 'Shares issued successfully' });
  } catch (error) {
    console.error('Error issuing shares:', error);
    res.status(500).json({ error: 'Failed to issue shares' });
  }
};

export const transferTokensHandler = async (req: Request, res: Response) => {
  try {
    const { from, to, amount, description, isAddress } = req.body;

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    if (isAddress) {
      await transferTokensToAddress(companyRegistry, from, to, amount);
    } else {
      await transferTokensToHandle(companyRegistry, from, to, amount);
      await createPayment(from, to, amount, description, "wire");
    }

    res.status(200).json({ message: 'Tokens transferred successfully' });
  } catch (error) {
    console.error('Error transferring tokens:', error);
    res.status(500).json({ error: 'Failed to transfer tokens' });
  }
};

export const getPaymentsHandler = async (req: Request, res: Response) => {
  try {
    const { handle } = req.query;

    const payments = await fetchPayments(handle as string);
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
}