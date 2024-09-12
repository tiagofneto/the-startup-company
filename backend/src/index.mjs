import { readFileSync } from 'fs';
import { deploy, createCompany } from './aztec.mjs';
import express from 'express';
import cors from 'cors';
import sampleCompanies from '../data/companies.json' assert { type: "json" };

const port = 3000;
const app = express();
app.use(express.json());
app.use(cors());

async function initializeServer() {
    console.log("Initializing server");

    console.log("Deploying registry");
    const { companyRegistryAddress } = await deploy();
    console.log("Registry deployed at", companyRegistryAddress);

    const companyCreationPromises = sampleCompanies.map(company => 
        createCompany(companyRegistryAddress, company.name, company.email, company.director, BigInt(company.totalShares))
    );

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


app.post('/create-company', async (req, res) => {
  try {
    const { name, email, director, totalShares } = req.body;
    
    if (!name || !email || !director || !totalShares) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
    const { companyRegistry} = addresses;

    const tx = await createCompany(companyRegistry, name, email, director, BigInt(totalShares));
    
    res.status(201).json(tx);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});
