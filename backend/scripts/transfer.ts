import { AztecAddress } from '@aztec/aztec.js';
import { getWallet, transferTokensToAddress, transferTokensToHandle } from '../src/aztec.js';
import { readFileSync } from 'fs';
const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
const { companyRegistry } = addresses;

const wallet = await getWallet();

const args = process.argv.slice(2);
let from = args[0];

if (args.includes('--handle')) {
  const to = args[args.indexOf('--handle') + 1];
  await transferTokensToHandle(companyRegistry, from, to, 1, wallet);
} else if (args.includes('--address')) {
  const to = args[args.indexOf('--address') + 1];
  await transferTokensToAddress(companyRegistry, from, AztecAddress.fromString(to), 1, wallet);
} else {
  console.error('Error: Either --handle or --address flag must be provided');
  process.exit(1);
}


