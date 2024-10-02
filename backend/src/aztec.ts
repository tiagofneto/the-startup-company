import { readFileSync, writeFileSync } from 'fs';
import { Contract, loadContractArtifact, createPXEClient, AztecAddress, Fr, GrumpkinScalar, AccountWalletWithSecretKey, waitForPXE } from '@aztec/aztec.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Company } from './types.js';
import { companyFromBigIntObject } from './utils.js';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { TokenContract, TokenContractArtifact } from '@aztec/noir-contracts.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CompanyRegistryJson = JSON.parse(readFileSync(join(__dirname, '../../contracts/target/contracts-CompanyRegistry.json'), 'utf-8'));

async function setupSandbox() {
  const { PXE_URL = 'http://localhost:8080' } = process.env;
  const pxe = await createPXEClient(PXE_URL);
  await waitForPXE(pxe);
  return pxe;
}

export async function getWallet() {
  const pxe = await setupSandbox();
  const secretKey = Fr.random();
  const signingPrivateKey = GrumpkinScalar.random();
  const wallet = await getSchnorrAccount(pxe, secretKey, signingPrivateKey).waitSetup();
  return wallet;
}

export async function deploy(wallet: AccountWalletWithSecretKey) {
  const CompanyRegistryArtifact = loadContractArtifact(CompanyRegistryJson as any);

  const tokenContract = await TokenContract.deploy(wallet, wallet.getAddress(), 'Internet Native USD', 'inUSD', 18)
    .send()
    .deployed();
  console.log('Token contract deployed at', tokenContract.address.toString());

  const companyRegistry = await Contract.deploy(wallet, CompanyRegistryArtifact, [tokenContract.address])
    .send()
    .deployed();
  console.log(`CompanyRegistry deployed at ${companyRegistry.address.toString()}`);

  await tokenContract.methods.set_minter(companyRegistry.address, true).send().wait();
  console.log('Token contract minter set');

  const addresses = { companyRegistry: companyRegistry.address.toString(), token: tokenContract.address.toString() };
  writeFileSync('addresses.json', JSON.stringify(addresses, null, 2));

  return addresses;
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

export async function transferTokensToHandle(wallet: AccountWalletWithSecretKey, contractAddress: string, from: string, to: string, amount: number) {
  const contract = await Contract.at(AztecAddress.fromString(contractAddress), loadContractArtifact(CompanyRegistryJson as any), wallet);

  console.log(`Transferring ${amount} tokens from ${from} to ${to}`);

  const tx = await contract.methods.transfer_tokens_to_handle(from, to, amount).send().wait();

  console.log(`Sent transfer tokens to handle transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}

export async function transferTokensToAddress(wallet: AccountWalletWithSecretKey, contractAddress: string, from: string, to: AztecAddress, amount: number) {
  const contract = await Contract.at(AztecAddress.fromString(contractAddress), loadContractArtifact(CompanyRegistryJson as any), wallet);

  console.log(`Transferring ${amount} tokens from ${from} to ${to}`);

  const tx = await contract.methods.transfer_tokens_to_address(from, to, amount).send().wait();

  console.log(`Sent transfer tokens to address transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}

export async function getCompanyBalance(wallet: AccountWalletWithSecretKey, contractAddress: string, handle: string) {
  const contract = await Contract.at(AztecAddress.fromString(contractAddress), loadContractArtifact(CompanyRegistryJson as any), wallet);

  console.log(`Getting company ${handle} balance`);
  const balance = await contract.methods.get_balance(handle).simulate();
  console.log(`Company ${handle} balance: ${balance}`);

  return balance;
}

export async function getTokenBalance(wallet: AccountWalletWithSecretKey, tokenAddress: string, address: AztecAddress) {
  const contract = await Contract.at(AztecAddress.fromString(tokenAddress), loadContractArtifact(TokenContractArtifact as any), wallet);

  console.log(`Getting token balance for ${address}`);
  const balance = await contract.methods.balance_of_public(address).simulate();
  console.log(`Token balance for ${address}: ${balance}`);

  return balance;
}