// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Token is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18;
    address public minter;

    event MinterChanged(address indexed newMinter);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        minter = msg.sender;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can call this");
        _;
    }

    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Invalid minter address");
        minter = _minter;
        emit MinterChanged(_minter);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds MAX_SUPPLY");
        _mint(to, amount);
    }

    function decimals() public view override returns (uint8) {
        return 18;
    }
}
