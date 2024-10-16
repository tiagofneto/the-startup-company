import 'dotenv/config';
import { deploy, getWallet, initWallet } from './aztec.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { authenticateToken } from './middleware.js';
import {
  getCompanyHandler,
  createCompanyHandler,
  getCompaniesHandler,
  getPeopleHandler,
  createCompanyUserHandler,
  getUserCompanies,
  getCompanyBalanceHandler,
  fundCompanyHandler
} from './handlers/company.js';
import { getProfile, verifyKyc } from './handlers/user.js';
import {
  createStreamHandler,
  getUserCompanyStreamsHandler,
  getUserStreams
} from './handlers/stream.js';

const port = 3000;
const skipInit = process.argv.includes('--skip-init');

const app = express();
app.use(express.json());
app.use(cors());

async function initializeServer() {
  await initWallet();
  if (skipInit) {
    console.log('Skipping initialization');
    return;
  }

  console.log('Initializing server');
  console.log('Deploying registry');
  const addresses = await deploy();
  console.log('Token deployed at', addresses.token);
  console.log('Registry deployed at', addresses.companyRegistry);
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
app.post('/company', authenticateToken, createCompanyHandler);
app.get('/companies', getCompaniesHandler);
// TODO permissioned
app.get('/company-people', getPeopleHandler);
app.post('/company-user', authenticateToken, createCompanyUserHandler);
app.post('/stream', authenticateToken, createStreamHandler);
app.get(
  '/user-company-streams',
  authenticateToken,
  getUserCompanyStreamsHandler
);
app.get('/company-balance', getCompanyBalanceHandler);
app.post('/fund-company', authenticateToken, fundCompanyHandler);
// User routes
app.get('/profile', authenticateToken, getProfile);
app.get('/user-companies', authenticateToken, getUserCompanies);
app.post('/verify-kyc', authenticateToken, verifyKyc);
app.get('/user-streams', authenticateToken, getUserStreams);
