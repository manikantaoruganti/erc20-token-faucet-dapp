// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import './Token.sol';

contract TokenFaucet {
    Token public token;
    address public admin;
    
    uint256 public constant FAUCET_AMOUNT = 10 * 10 ** 18;
    uint256 public constant COOLDOWN_TIME = 86400;
    uint256 public constant MAX_CLAIM_AMOUNT = 1000 * 10 ** 18;
    
    bool public paused = false;
    
    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;
    
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }
    
    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        token = Token(_token);
        admin = msg.sender;
    }
    
    function requestTokens() external {
        require(!paused, "Faucet is paused");
        require(canClaim(msg.sender), "Not eligible to claim");
        require(remainingAllowance(msg.sender) >= FAUCET_AMOUNT, "Insufficient allowance");
        
        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;
        
        require(token.mint(msg.sender, FAUCET_AMOUNT), "Mint failed");
        
        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }
    
    function canClaim(address user) public view returns (bool) {
        if (paused) return false;
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        return true;
    }
    
    function remainingAllowance(address user) public view returns (uint256) {
        uint256 allowed = MAX_CLAIM_AMOUNT - totalClaimed[user];
        return allowed > 0 ? allowed : 0;
    }
    
    function isPaused() external view returns (bool) {
        return paused;
    }
    
    function setPaused(bool _paused) external onlyAdmin {
        paused = _paused;
        emit FaucetPaused(_paused);
    }
}
