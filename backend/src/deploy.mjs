import { Contract, loadContractArtifact, createPXEClient } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import CompanyRegistryJson from "../../contracts/target/contracts-CompanyRegistry.json" assert { type: "json" };


const { PXE_URL = 'http://localhost:8080' } = process.env;

export async function deploy() {
  const pxe = createPXEClient(PXE_URL);
  const [ownerWallet] = await getInitialTestAccountsWallets(pxe);
  const ownerAddress = ownerWallet.getCompleteAddress();

  const CompanyRegistryArtifact = loadContractArtifact(CompanyRegistryJson);
  const companyRegistry = await Contract.deploy(ownerWallet, CompanyRegistryArtifact, [])
    .send()
    .deployed();

  console.log(`CompanyRegistry deployed at ${companyRegistry.address.toString()}`);

  //const addresses = { companyRegistry: companyRegistry.address.toString() };
  //writeFileSync('addresses.json', JSON.stringify(addresses, null, 2));
}