import { readFileSync, writeFileSync } from 'fs';
import { Contract, loadContractArtifact, createPXEClient, AztecAddress, Fr, GrumpkinScalar, AccountWalletWithSecretKey } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Company } from './types.js';
import { companyFromBigIntObject, toString } from './utils.js';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { PXE_URL = 'http://localhost:8080' } = process.env;
const pxe = createPXEClient(PXE_URL);

const CompanyRegistryJson = JSON.parse(readFileSync(join(__dirname, '../../contracts/target/contracts-CompanyRegistry.json'), 'utf-8'));

export async function getWallet() {
  const secretKey = Fr.random();
  const signingPrivateKey = GrumpkinScalar.random();
  const wallet = await getSchnorrAccount(pxe, secretKey, signingPrivateKey).waitSetup();
  return wallet;
}

export async function deploy(wallet: AccountWalletWithSecretKey) {
  const CompanyRegistryArtifact = loadContractArtifact(CompanyRegistryJson as any);
  // TODO pass in token address instead of random
  const companyRegistry = await Contract.deploy(wallet, CompanyRegistryArtifact, [Fr.random()])
    .send()
    .deployed();

  const address = companyRegistry.address.toString();

  console.log(`CompanyRegistry deployed at ${address}`);

  const addresses = { companyRegistry: address };
  writeFileSync('addresses.json', JSON.stringify(addresses, null, 2));

  return { companyRegistryAddress: address };
}

export async function createCompany(wallet: AccountWalletWithSecretKey, contractAddress: string, company: Company) {
  const contract = await Contract.at(AztecAddress.fromString(contractAddress), loadContractArtifact(CompanyRegistryJson as any), wallet);

  console.log(`Creating company:`, company);

  const tx = await contract.methods.create_company(company.name, company.handle, company.email, company.director, company.totalShares).send().wait();

  console.log(`Sent create company transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}

export async function getCompany(wallet: AccountWalletWithSecretKey, contractAddress: string, handle: string) {
  const contract = await Contract.at(AztecAddress.fromString(contractAddress), loadContractArtifact(CompanyRegistryJson as any), wallet);

  console.log(`Getting company ${handle}`);
  const rawCompany = await contract.methods.get_company(handle).simulate();
  //console.log(`Company ${handle}: ${JSON.parse(JSON.stringify(company, (_, value) =>
  //  typeof value === 'bigint' ? toString(value) : value
  //))}`);
  const serializedCompany = companyFromBigIntObject(rawCompany);
  const company = serializedCompany.handle ? serializedCompany : null;
  console.log(`Company ${handle}: ${JSON.stringify(company)}`);

  return company;
}