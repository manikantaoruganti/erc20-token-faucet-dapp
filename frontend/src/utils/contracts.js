import { ethers } from 'ethers'

const TOKEN_FAUCET_ABI = [
  "function requestTokens() external",
  "function canClaim(address account) external view returns (bool)",
  "function remainingAllowance(address account) external view returns (uint256)",
  "function isPaused() external view returns (bool)",
  "event TokensClaimed(address indexed claimer, uint256 amount, uint256 timestamp)"
]

const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
]

// This will be set from deployment output
const FAUCET_ADDRESS = process.env.REACT_APP_FAUCET_ADDRESS || '0x0000000000000000000000000000000000000000'
const TOKEN_ADDRESS = process.env.REACT_APP_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000'

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed')
  }
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  return accounts[0]
}

export async function getContractInstance(account) {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner(account)
  return new ethers.Contract(FAUCET_ADDRESS, TOKEN_FAUCET_ABI, signer)
}

export async function requestTokens(contract, account) {
  if (!contract) throw new Error('Contract not initialized')
  try {
    const tx = await contract.requestTokens()
    const receipt = await tx.wait()
    return receipt
  } catch (error) {
    if (error.reason) {
      throw new Error(error.reason)
    }
    throw error
  }
}

export async function canClaim(contract, account) {
  if (!contract || !account) throw new Error('Missing contract or account')
  try {
    return await contract.canClaim(account)
  } catch (error) {
    throw error
  }
}

export async function remainingAllowance(contract, account) {
  if (!contract || !account) throw new Error('Missing contract or account')
  try {
    const amount = await contract.remainingAllowance(account)
    return ethers.formatEther(amount)
  } catch (error) {
    throw error
  }
}

export async function isPaused(contract) {
  if (!contract) throw new Error('Contract not initialized')
  try {
    return await contract.isPaused()
  } catch (error) {
    throw error
  }
}
