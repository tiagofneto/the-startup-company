# The Startup Company

## Context
- We got a grant from [Aztec](https://aztec.network/) to build an MVP of an incorporation platform that lets founders register a company, verify their identity (KYC & AML), purchase company shares and initiate their first payment in 5 minutes.
- Whilst we managed to build a basic version of the product, we did not manage to convince a jurisdiction to let us build their onchain company registry within a timeline compatible for us to raise a seed round.
- We are now opensourcing our work and our learnings with the hope of motivating other teams to advance [INCs](https://inc.mirror.xyz/).
<div align="center">
    <a href="https://www.loom.com/share/1a3d767dae5b4c18acb4a1650d1e5faa">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/1a3d767dae5b4c18acb4a1650d1e5faa-6b1b0ee636647d2b-full-play.gif">
    </a>
</div>

## Prerequisites
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started
1. Create a `.env` file from the `.env.example` and fill it with the appropriate values:
```bash
cp .env.example .env
```
Then edit the `.env` file with your specific configuration.

2. Run the following command:
```bash
docker compose up
```
If you've made changes to the codebase, use the `--build` flag to rebuild the images:
```bash
docker compose up --build
```

3. Wait for all containers to start. The process is complete when you see the Next.js startup information in the console for the `startup-company-monorepo-frontend-1` container (this typically takes around 1 minute).

4. Once the frontend container displays the Next.js startup information, you can access the application at `localhost:8000`

## Running Individual Components
If you wish to run individual components separately, please refer to the README files in each package directory.
