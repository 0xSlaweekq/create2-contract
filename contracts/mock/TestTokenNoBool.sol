// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

event Transfer(uint256 indexed amount, address indexed from, address to);

contract TestTokenNoBool {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        name = "TestTokenNoBool";
        symbol = "TTNB";
        decimals = 18;
        balanceOf[msg.sender] += 1e24;
        totalSupply += 1e24;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(amount, msg.sender, to);
    }

    function transfer(address to, uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(amount, msg.sender, to);
    }

    function transferMany(address[] calldata to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount * to.length, "Insufficient balance");

        for (uint256 i = 0; i < to.length; ) {
            balanceOf[msg.sender] -= amount;
            balanceOf[to[i]] += amount;

            emit Transfer(amount, msg.sender, to[i]);
            unchecked {
                ++i;
            }
        }
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");

        balanceOf[from] -= amount;
        allowance[from][msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(amount, from, to);
    }

    function approve(address spender, uint256 amount) external {
        allowance[msg.sender][spender] = amount;
    }
}
