import { getWallet, deploy, createCompany } from '../src/aztec.js';

const wallet = await getWallet();
const addresses = await deploy(wallet);
console.log('Addresses:', addresses);