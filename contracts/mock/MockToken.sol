// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title MockToken
 * @dev A mock token contract for testing purposes.
 */
contract MockToken {
  function transfer(address to, uint256 amount) external returns (bool) {}
  /**
   * @dev Approves the specified address to spend the caller's tokens.
   * @param spender The address to be approved.
   * @param value The amount of tokens to be approved.
   * @return . A boolean indicating whether the approval was successful.
   */
  function approve(address spender, uint256 value) external returns (bool) {}

  /**
   * @dev Retrieves the balance of tokens owned by the specified address.
   * @param owner The address for which the balance is to be retrieved.
   * @return The balance of tokens owned by the specified address.
   */
  function balanceOf(address owner) external view returns (uint256) {}

  /**
   * @dev Retrieves the amount of tokens that an owner allowed a spender to spend.
   * @param owner The address of the token owner.
   * @param spender The address of the account that is allowed to spend the tokens.
   * @return The number of tokens spender is allowed to spend on behalf of owner.
   */
  function allowance(address owner, address spender) external view returns (uint) {}

  /**
   * @dev Retrieves the name of the token.
   * @return The name of the token.
   */
  function name() public view returns (string memory) {}

  /**
   * @dev Retrieves the number of decimal places the token uses.
   * @return The number of decimal places for the token.
   */
  function decimals() public view returns (uint8) {}
}
