import { useEffect, useState } from 'react'
import { getContractInstance, connectWallet, requestTokens, canClaim, remainingAllowance, isPaused } from './utils/contracts'
import './App.css'

function App() {
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Expose window.__EVAL__ interface as required
  useEffect(() => {
    window.__EVAL__ = {
      connectWallet: async () => {
        try {
          const acc = await connectWallet()
          setAccount(acc)
          const inst = await getContractInstance(acc)
          setContract(inst)
          return acc
        } catch (error) {
          setMessage('Error: ' + error.message)
          throw error
        }
      },
      requestTokens: async () => {
        try {
          setLoading(true)
          const result = await requestTokens(contract, account)
          setMessage('Tokens claimed successfully!')
          return result
        } catch (error) {
          setMessage('Error: ' + error.message)
          throw error
        } finally {
          setLoading(false)
        }
      },
      canClaim: async () => {
        try {
          return await canClaim(contract, account)
        } catch (error) {
          setMessage('Error: ' + error.message)
          throw error
        }
      },
      remainingAllowance: async () => {
        try {
          return await remainingAllowance(contract, account)
        } catch (error) {
          setMessage('Error: ' + error.message)
          throw error
        }
      },
      isPaused: async () => {
        try {
          return await isPaused(contract)
        } catch (error) {
          setMessage('Error: ' + error.message)
          throw error
        }
      },
      getAccount: () => account,
      getContract: () => contract
    }
  }, [contract, account])

  const handleConnect = async () => {
    try {
      const acc = await window.__EVAL__.connectWallet()
      setMessage('Wallet connected: ' + acc)
    } catch (error) {
      setMessage('Connection failed: ' + error.message)
    }
  }

  const handleClaim = async () => {
    try {
      if (!account || !contract) {
        setMessage('Please connect wallet first')
        return
      }
      await window.__EVAL__.requestTokens()
    } catch (error) {
      setMessage('Claim failed: ' + error.message)
    }
  }

  return (
    <div className="container">
      <h1>ERC-20 Token Faucet</h1>
      <div className="status">
        {account ? (
          <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
        ) : (
          <p>Not connected</p>
        )}
      </div>
      <div className="buttons">
        <button onClick={handleConnect} disabled={loading}>Connect Wallet</button>
        <button onClick={handleClaim} disabled={loading || !account}>Claim Tokens</button>
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  )
}

export default App
