import { writeFileSync } from 'fs';
import { Contract, loadContractArtifact, createPXEClient, AztecAddress } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import CompanyRegistryJson from "../../contracts/target/contracts-CompanyRegistry.json" assert { type: "json" };

const { PXE_URL = 'http://localhost:8080' } = process.env;
const pxe = createPXEClient(PXE_URL);

export async function deploy() {
  const [ownerWallet] = await getInitialTestAccountsWallets(pxe);
  // const ownerAddress = ownerWallet.getCompleteAddress();

  const CompanyRegistryArtifact = loadContractArtifact(CompanyRegistryJson);
  const companyRegistry = await Contract.deploy(ownerWallet, CompanyRegistryArtifact, [])
    .send()
    .deployed();

  const address = companyRegistry.address.toString();

  console.log(`CompanyRegistry deployed at ${address}`);

  const addresses = { companyRegistry: address };
  writeFileSync('addresses.json', JSON.stringify(addresses, null, 2));

  return { companyRegistryAddress: address };
}

export async function createCompany(contractAddress, name, email, director, totalShares) {
  const [ownerWallet] = await getInitialTestAccountsWallets(pxe);

  const contract = await Contract.at(AztecAddress.fromString(contractAddress), loadContractArtifact(CompanyRegistryJson), ownerWallet);

  console.log(`Creating company ${name} with email ${email}, director ${director}, and total shares ${totalShares}`);

  const tx = await contract.methods.create_company(name, email, director, totalShares).send().wait();

  console.log(`Sent create company transaction 0x${tx.txHash}`);
  console.log(`Transaction has been mined on block ${tx.blockNumber}`);

  return tx;
}

export async function getCompany(contractAddress, id) {
  const [ownerWallet] = await getInitialTestAccountsWallets(pxe);

  const contract = await Contract.at(AztecAddress.fromString(contractAddress), loadContractArtifact(CompanyRegistryJson), ownerWallet);

  console.log(`Getting company ${id}`);
  const company = await contract.methods.get_company(id).simulate();
  console.log(`Company ${id}: ${company}`);

  return company;
}