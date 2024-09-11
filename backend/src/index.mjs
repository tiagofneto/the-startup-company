import { deploy } from './deploy.mjs';

async function main() {
    await deploy();
}

main().catch((err) => {
    console.error(`Error in deployment script: ${err}`);
    process.exit(1);
});