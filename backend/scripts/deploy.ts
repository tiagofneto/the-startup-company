import { getWallet, deploy } from '../src/aztec.js';

const wallet = await getWallet();
console.log('Wallet:', wallet);
const { companyRegistryAddress } = await deploy(wallet);
console.log('Company registry address:', companyRegistryAddress);
