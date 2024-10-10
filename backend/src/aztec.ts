import { readFileSync, writeFileSync } from 'fs';
import {
  Contract,
  loadContractArtifact,
  createPXEClient,
  AztecAddress,
  Fr,
  GrumpkinScalar,
  AccountWalletWithSecretKey,
  waitForPXE
} from '@aztec/aztec.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Company } from './types.js';
import { companyFromBigIntObject } from './utils.js';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { TokenContract, TokenContractArtifact } from '@aztec/noir-contracts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let globalWallet: AccountWalletWithSecretKey | null = null;

const CompanyRegistryJson = JSON.parse(
  readFileSync(
    join(__dirname, '../../contracts/target/contracts-CompanyRegistry.json'),
    'utf-8'
  )
);

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
  const wallet = await getSchnorrAccount(
    pxe,
    secretKey,
    signingPrivateKey
  ).waitSetup();
  return wallet;
}

export async function initWallet() {
  globalWallet = await getWallet();
}

export async function deploy(
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const CompanyRegistryArtifact = loadContractArtifact(
    CompanyRegistryJson as any
  );

  const tokenContract = await TokenContract.deploy(
    wallet,
    wallet.getAddress(),
    'Internet Native USD',
    'inUSD',
    18
  )
    .send()
    .deployed();
  console.log('Token contract deployed at', tokenContract.address.toString());

  const companyRegistry = await Contract.deploy(
    wallet,
    CompanyRegistryArtifact,
    [tokenContract.address]
  )
    .send()
    .deployed();
  console.log(
    `CompanyRegistry deployed at ${companyRegistry.address.toString()}`
  );

  await tokenContract.methods
    .set_minter(companyRegistry.address, true)
    .send()
    .wait();
  console.log('Token contract minter set');

  const addresses = {
    companyRegistry: companyRegistry.address.toString(),
    token: tokenContract.address.toString()
  };
  writeFileSync('addresses.json', JSON.stringify(addresses, null, 2));

  return addresses;
}

export async function createCompany(
  contractAddress: string,
  user_id: string,
  company: Company,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(contractAddress),
    loadContractArtifact(CompanyRegistryJson as any),
    wallet
  );

  console.log(`Creating company:`, company);

  const tx = await contract.methods
    .create_company(
      user_id,
      company.name,
      company.handle,
      company.email,
      company.director,
      company.totalShares
    )
    .send()
    .wait();

  console.log(`Sent create company transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}

export async function getCompany(
  contractAddress: string,
  handle: string,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(contractAddress),
    loadContractArtifact(CompanyRegistryJson as any),
    wallet
  );

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

export async function transferTokensToHandle(
  contractAddress: string,
  from: string,
  to: string,
  amount: number,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(contractAddress),
    loadContractArtifact(CompanyRegistryJson as any),
    wallet
  );

  console.log(`Transferring ${amount} tokens from ${from} to ${to}`);

  const tx = await contract.methods
    .transfer_tokens_to_handle(from, to, amount)
    .send()
    .wait();

  console.log(`Sent transfer tokens to handle transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}

export async function transferTokensToAddress(
  contractAddress: string,
  from: string,
  to: AztecAddress,
  amount: number,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(contractAddress),
    loadContractArtifact(CompanyRegistryJson as any),
    wallet
  );

  console.log(`Transferring ${amount} tokens from ${from} to ${to}`);

  const tx = await contract.methods
    .transfer_tokens_to_address(from, to, amount)
    .send()
    .wait();

  console.log(`Sent transfer tokens to address transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}

export async function getCompanyBalance(
  contractAddress: string,
  handle: string,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(contractAddress),
    loadContractArtifact(CompanyRegistryJson as any),
    wallet
  );

  console.log(`Getting company ${handle} balance`);
  const balance = await contract.methods.get_balance(handle).simulate();
  console.log(`Company ${handle} balance: ${balance}`);

  return balance;
}

export async function getTokenBalance(
  tokenAddress: string,
  address: AztecAddress,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(tokenAddress),
    loadContractArtifact(TokenContractArtifact as any),
    wallet
  );

  console.log(`Getting token balance for ${address}`);
  const balance = await contract.methods.balance_of_public(address).simulate();
  console.log(`Token balance for ${address}: ${balance}`);

  return balance;
}

export async function createStream(
  contractAddress: string,
  user_id: string,
  handle: string,
  rate: number,
  targetAddress: AztecAddress,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(contractAddress),
    loadContractArtifact(CompanyRegistryJson as any),
    wallet
  );

  console.log(
    `Creating stream for company ${handle} to ${targetAddress} at rate ${rate}`
  );
  const tx = await contract.methods
    .create_stream(user_id, handle, rate, targetAddress)
    .send()
    .wait();

  console.log(`Sent create stream transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}

export async function claimStream(
  contractAddress: string,
  id: number,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(contractAddress),
    loadContractArtifact(CompanyRegistryJson as any),
    wallet
  );

  console.log(`Claiming stream ${id}`);
  const tx = await contract.methods.claim_stream(id).send().wait();

  console.log(`Sent claim stream transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);
}

export async function verifyUser(
  contractAddress: string,
  user_id: string,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(contractAddress),
    loadContractArtifact(CompanyRegistryJson as any),
    wallet
  );

  console.log(`Verifying user ${user_id}`);
  const tx = await contract.methods.verify_user(user_id).send().wait();

  console.log(`Sent verify user transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}

export async function isUserVerified(
  contractAddress: string,
  user_id: string,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(contractAddress),
    loadContractArtifact(CompanyRegistryJson as any),
    wallet
  );

  console.log(`Checking if user ${user_id} is verified`);
  const isVerified = await contract.methods.is_user_verified(user_id).simulate();
  console.log(`User ${user_id} is verified: ${isVerified}`);

  return isVerified;
}

export async function authorizeUser(
  contractAddress: string,
  handle: string,
  email: string,
  wallet: AccountWalletWithSecretKey = globalWallet!
) {
  const contract = await Contract.at(
    AztecAddress.fromString(contractAddress),
    loadContractArtifact(CompanyRegistryJson as any),
    wallet
  );

  console.log(`Authorizing user ${email} for company ${handle}`);
  const tx = await contract.methods.authorize_user(handle, email).send().wait();

  console.log(`Sent authorize user transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}
