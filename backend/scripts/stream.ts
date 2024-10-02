import { AztecAddress } from '@aztec/aztec.js';
import { getWallet, createStream, claimStream } from '../src/aztec.js';
import { readFileSync } from 'fs';

const addresses = JSON.parse(readFileSync('addresses.json', 'utf-8'));
const { companyRegistry } = addresses;

const wallet = await getWallet();

const args = process.argv.slice(2);

if (args[0] === '--create') {
  if (!args.includes('--handle') || !args.includes('--rate') || !args.includes('--target')) {
    console.error('Error: --handle, --rate, and --target flags must be provided');
    process.exit(1);
  }

  const handle = args[args.indexOf('--handle') + 1];
  const rate = args[args.indexOf('--rate') + 1];
  const target = args[args.indexOf('--target') + 1];

  await createStream(wallet, companyRegistry, handle, Number(rate), AztecAddress.fromString(target));
} else if (args[0] === '--claim') {
  const id = args[1];
  await claimStream(wallet, companyRegistry, Number(id));
} else {
  console.error('Error: --create flag must be provided');
  process.exit(1);
}
