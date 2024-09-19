# The Startup Company

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
2. Wait for all containers to start. The process is complete when you see the Next.js startup information in the console for the `startup-company-monorepo-frontend-1` container (this typically takes around 1 minute).
3. Once the frontend container displays the Next.js startup information, you can access the application at `localhost:8000`

## Running Individual Components
If you wish to run individual components separately, please refer to the README files in each package directory.