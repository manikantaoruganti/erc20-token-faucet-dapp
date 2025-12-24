const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Deploy Token
  const Token = await ethers.getContractFactory('Token');
  const token = await Token.deploy('FaucetToken', 'FCT');
  await token.deployed();
  console.log(`Token deployed at: ${token.address}`);

  // Deploy TokenFaucet
  const TokenFaucet = await ethers.getContractFactory('TokenFaucet');
  const faucet = await TokenFaucet.deploy(token.address);
  await faucet.deployed();
  console.log(`TokenFaucet deployed at: ${faucet.address}`);

  // Set minter
  await token.setMinter(faucet.address);
  console.log('Minter set successfully');

  // Save addresses
  const addresses = {
    token: token.address,
    faucet: faucet.address,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId
  };

  const filePath = path.join(__dirname, '../deployment-addresses.json');
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));
  console.log(`Addresses saved to ${filePath}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
