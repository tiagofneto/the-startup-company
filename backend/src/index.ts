import 'dotenv/config';
import { readFileSync } from 'fs';
import { fetchCompany, getCompanies, uploadCompany } from './interactions.js';
import { deploy, createCompany, getCompany } from './aztec.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Company } from './types.js';

const port = 3000;

let sampleCompanies: Company[];

async function loadSampleCompanies() {
  sampleCompanies = (await import('../data/companies.json', { assert: { type: 'json' } })).default;
}

const app = express();
app.use(express.json());
app.use(cors());

async function initializeServer() {
    await loadSampleCompanies();
    console.log("Initializing server");

    console.log("Deploying registry");
    const { companyRegistryAddress } = await deploy();
    console.log("Registry deployed at", companyRegistryAddress);

    const companyCreationPromises = sampleCompanies.map((company: Company) => {
        createCompany(companyRegistryAddress, company);
        uploadCompany(company);
    });

    await Promise.all(companyCreationPromises);
}

initializeServer()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  });

app.get('/health', (req: Request, res: Response) => {
    res.sendStatus(200);
});

app.get('/company', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing company ID' });
    }

    //const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    //const { companyRegistry } = addresses;

    //const company = await getCompany(companyRegistry, Number(id));
    const company = await fetchCompany(Number(id));
    
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});


app.post('/company', async (req: Request, res: Response) => {
  try {
    const { name, email, director, totalShares } = req.body;
    
    if (!name || !email || !director || !totalShares) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry } = addresses;

    const company = { name, email, director, totalShares };

    // Onchain
    const tx = await createCompany(companyRegistry, company);
    // Offchain
    await uploadCompany(company);

    res.status(201).json(tx);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

app.get('/companies', async (req: Request, res: Response) => {
  try {
    const companies = await getCompanies();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});
