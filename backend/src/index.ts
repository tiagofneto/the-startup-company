import 'dotenv/config';
import { deploy } from './aztec.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { authenticateToken } from './middleware.js';
import { getCompanyHandler, createCompanyHandler, getCompaniesHandler } from './handlers/company.js';
import { getProfile, getUserCompanies } from './handlers/user.js';

const port = 3000;
const skipInit = process.argv.includes('--skip-init');

const app = express();
app.use(express.json());
app.use(cors());

async function initializeServer() {
    if (skipInit) {
        console.log("Skipping initialization");
        return;
    }

    console.log("Initializing server");
    console.log("Deploying registry");
    const { companyRegistryAddress } = await deploy();
    console.log("Registry deployed at", companyRegistryAddress);
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

// Company routes
app.get('/company', getCompanyHandler);
app.post('/company', createCompanyHandler);
app.get('/companies', getCompaniesHandler);

// User routes
app.get('/profile', authenticateToken, getProfile);
app.get('/companies', authenticateToken, getUserCompanies);
