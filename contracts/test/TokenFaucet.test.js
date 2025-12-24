const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TokenFaucet', function () {
  let token, faucet, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('Token');
    token = await Token.deploy('Test Token', 'TT');
    await token.deployed();

    const TokenFaucet = await ethers.getContractFactory('TokenFaucet');
    faucet = await TokenFaucet.deploy(token.address);
    await faucet.deployed();

    await token.setMinter(faucet.address);
  });

  describe('Deployment', function () {
    it('Should initialize correctly', async function () {
      expect(await faucet.admin()).to.equal(owner.address);
      expect(await faucet.paused()).to.equal(false);
    });
  });

  describe('Claiming Tokens', function () {
    it('Should allow valid claim', async function () {
      await faucet.connect(user1).requestTokens();
      const balance = await token.balanceOf(user1.address);
      expect(balance).to.equal(ethers.utils.parseEther('10'));
    });

    it('Should emit TokensClaimed event', async function () {
      await expect(faucet.connect(user1).requestTokens())
        .to.emit(faucet, 'TokensClaimed')
        .withArgs(user1.address, ethers.utils.parseEther('10'), await ethers.provider.getBlockNumber().then(n => n + 1));
    });
  });

  describe('Cooldown', function () {
    it('Should enforce 24-hour cooldown', async function () {
      await faucet.connect(user1).requestTokens();
      await expect(faucet.connect(user1).requestTokens())
        .to.be.revertedWith('Not eligible to claim');
    });
  });

  describe('Lifetime Limit', function () {
    it('Should enforce lifetime limit', async function () {
      for (let i = 0; i < 100; i++) {
        await faucet.connect(user1).requestTokens();
        await ethers.provider.send('evm_increaseTime', [86401]);
      }
      await expect(faucet.connect(user1).requestTokens())
        .to.be.revertedWith('Not eligible to claim');
    });
  });

  describe('Pause', function () {
    it('Should allow admin to pause', async function () {
      await faucet.setPaused(true);
      expect(await faucet.isPaused()).to.equal(true);
    });

    it('Should prevent claims when paused', async function () {
      await faucet.setPaused(true);
      await expect(faucet.connect(user1).requestTokens())
        .to.be.revertedWith('Faucet is paused');
    });
  });
});
