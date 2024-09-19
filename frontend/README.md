# Frontend

## Prerequisites
- [Node.js](https://nodejs.org/en/download) version 18
- Running backend server (refer to the [README in the backend package](../backend/README.md) for more information)

## Getting Started
1. Create a `.env.local` file from the `.env.local.example` and fill it with the appropriate values:
```bash
cp .env.local.example .env.local
```
Then edit the `.env.local` file with your specific configuration.

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Access the application at `localhost:8000`