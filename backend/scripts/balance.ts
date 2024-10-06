import { AztecAddress } from '@aztec/aztec.js';
import { getWallet, getCompanyBalance, getTokenBalance } from '../src/aztec.js';
import { readFileSync } from 'fs';

const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
const { companyRegistry, token } = addresses;

const wallet = await getWallet();

const args = process.argv.slice(2);

if (args[0] === '--token') {
  const address = args[1];
  const balance = await getTokenBalance(wallet, token, AztecAddress.fromString(address));
  console.log(`Token balance for ${address}: ${balance}`);
} else if (args[0] === '--company') {
  const handle = args[1];
  const balance = await getCompanyBalance(wallet, companyRegistry, handle);
  console.log(`Company ${handle} balance: ${balance}`);
} else {
  console.error('Error: Either --token or --company flag must be provided');
  process.exit(1);
}
