# ERC-20 Token Faucet DApp - Deployment Guide

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MetaMask wallet
- Sepolia testnet ETH for gas fees

## Quick Start with Docker

```bash
docker-compose up
```

This starts:
- Smart contract deployment
- Frontend on http://localhost:3000 within 60 seconds

## Smart Contract Functions

### requestTokens()
- Claims tokens if eligibility criteria met
- Enforces 24-hour cooldown between claims
- Respects lifetime claim limits

### canClaim(address)
- Returns boolean indicating claim eligibility

### remainingAllowance(address)
- Returns remaining claimable amount

### isPaused()
- Faucet pause status

## Frontend window.__EVAL__ Interface

The frontend exposes a global `window.__EVAL__` object:

```javascript
// Connect wallet
await window.__EVAL__.connectWallet()

// Request tokens
await window.__EVAL__.requestTokens()

// Check eligibility
const canClaim = await window.__EVAL__.canClaim()

// Get remaining allowance
const allowance = await window.__EVAL__.remainingAllowance()

// Check if paused
const paused = await window.__EVAL__.isPaused()
```

## Deployment to Sepolia

1. Set environment variables in .env
2. Run: `npx hardhat run scripts/deploy.js --network sepolia`
3. Verify contracts on Etherscan
4. Update frontend with contract addresses

## Testing

```bash
cd .
npm install
npx hardhat test
```
