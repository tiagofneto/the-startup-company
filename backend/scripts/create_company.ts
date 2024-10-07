import { readFileSync } from 'fs';
import { createCompany, getWallet } from '../src/aztec.js';

const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
const { companyRegistry } = addresses;

const wallet = await getWallet();

const handle = process.argv[2];
if (!handle) {
  console.error('Handle is required');
  process.exit(1);
}

await createCompany(companyRegistry, {
  name: 'test',
  handle,
  email: 'test@test.com',
  director: 'test',
  totalShares: 100,
}, wallet);
