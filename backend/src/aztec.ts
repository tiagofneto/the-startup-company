import { readFileSync, writeFileSync } from 'fs';
import { Contract, loadContractArtifact, createPXEClient, AztecAddress } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Company } from './types.js';
import { companyFromBigIntObject, toString } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { PXE_URL = 'http://localhost:8080' } = process.env;
const pxe = createPXEClient(PXE_URL);

const CompanyRegistryJson = JSON.parse(readFileSync(join(__dirname, '../../contracts/target/contracts-CompanyRegistry.json'), 'utf-8'));

export async function deploy() {
  const [ownerWallet] = await getInitialTestAccountsWallets(pxe);
  // const ownerAddress = ownerWallet.getCompleteAddress();

  const CompanyRegistryArtifact = loadContractArtifact(CompanyRegistryJson as any);
  const companyRegistry = await Contract.deploy(ownerWallet, CompanyRegistryArtifact, [])
    .send()
    .deployed();

  const address = companyRegistry.address.toString();

  console.log(`CompanyRegistry deployed at ${address}`);

  const addresses = { companyRegistry: address };
  writeFileSync('addresses.json', JSON.stringify(addresses, null, 2));

  return { companyRegistryAddress: address };
}

export async function createCompany(contractAddress: string, company: Company) {
  const [ownerWallet] = await getInitialTestAccountsWallets(pxe);

  const contract = await Contract.at(AztecAddress.fromString(contractAddress), loadContractArtifact(CompanyRegistryJson as any), ownerWallet);

  console.log(`Creating company:`, company);

  const tx = await contract.methods.create_company(company.name, company.handle, company.email, company.director, company.totalShares).send().wait();

  console.log(`Sent create company transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}

export async function getCompany(contractAddress: string, handle: string) {
  const [ownerWallet] = await getInitialTestAccountsWallets(pxe);

  const contract = await Contract.at(AztecAddress.fromString(contractAddress), loadContractArtifact(CompanyRegistryJson as any), ownerWallet);

  console.log(`Getting company ${handle}`);
  const rawCompany = await contract.methods.get_company(handle).simulate();
  //console.log(`Company ${handle}: ${JSON.parse(JSON.stringify(company, (_, value) =>
  //  typeof value === 'bigint' ? toString(value) : value
  //))}`);
  const company = companyFromBigIntObject(rawCompany);
  console.log(`Company ${handle}: ${JSON.stringify(company)}`);

  return company;
}