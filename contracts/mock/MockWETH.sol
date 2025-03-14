// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title MockWETH contract
 * @dev This contract represents a mock implementation of the WETH (Wrapped Ether) token.
 */
contract MockWETH {
  /**
   * @dev Deposits Ether into the contract.
   */
  function deposit() external payable {}

  /**
   * @dev Withdraws the specified amount of tokens.
   * @param . amount The amount of tokens to withdraw.
   */
  function withdraw(uint256) external {}

  /**
   * @dev Retrieves the balance of tokens owned by the specified address.
   * @param owner The address for which the balance is to be retrieved.
   * @return The balance of tokens owned by the specified address.
   */
  function balanceOf(address owner) external view returns (uint256) {}

  function allowance(address owner, address spender) external view returns (uint) {}

  /**
   * @dev Approves the spender to spend the specified value of tokens.
   * @param spender The address of the spender.
   * @param value The amount of tokens to approve.
   * @return A boolean indicating whether the
   */
  function approve(address spender, uint256 value) public returns (bool) {}
}
