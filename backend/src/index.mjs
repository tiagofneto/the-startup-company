import { deploy, createCompany } from './aztec.mjs';

async function main() {
    const { companyRegistryAddress } = await deploy();
    const tx = await createCompany(companyRegistryAddress, "Company 1", "company1@example.com", "Director 1", 100n);
}

main().catch((err) => {
    console.error(`Error in deployment script: ${err}`);
    process.exit(1);
});