# Backend

## Prerequisites
- [Node.js](https://nodejs.org/en/download) version 18
- Compiled contracts (refer to the [README in the contracts package](../contracts/README.md) for more information)
- Aztec sandbox (follow the instructions at [Aztec Quickstart Guide](https://docs.aztec.network/guides/developer_guides/getting_started/quickstart))

## Getting Started
1. Create a `.env` file from the `.env.example` and fill it with the appropriate values:
```bash
cp .env.example .env
```
Then edit the `.env` file with your specific configuration.

2. Install dependencies:
```bash
npm install
```

3. Start the Aztec sandbox (in a separate terminal):
```bash
aztec start --sandbox
```

4. Run the server:
```bash
node src/index.mjs
```