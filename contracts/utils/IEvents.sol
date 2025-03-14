// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title IEvents
 * @dev This library defines events used across the system for logging key actions and changes.
 */
interface IEvents {
  /**
   * @notice Emitted when the admin system is initialized.
   * @param owner The address of the owner.
   * @param factory The address of the factory contract.
   * @param withdrawal The address of the withdrawals contract for proxy.
   */
  event AdminInitialized(address indexed owner, address indexed factory, address indexed withdrawal);

  /**
   * @notice Emitted when an account's admin status is changed.
   * @param account The address of the account whose status is changed.
   * @param status The new admin status (true = granted, false = revoked).
   */
  event AdminStatusChanged(address indexed account, bool status);

  /**
   * @notice Emitted when a new clone contract is created.
   * @param clone The address of the newly created clone contract.
   * @param withdrawal The withdrawal address used by the clone.
   * @param owner The owner of the clone.
   */
  event CloneCreated(address indexed clone, address indexed withdrawal, address indexed owner);

  /**
   * @notice Emitted when a specific field is updated.
   * @param field The updated field (e.g., "Factory" or "Withdrawal").
   * @param oldValue The old address value of the field.
   * @param newValue The new address value of the field.
   */
  event FieldUpdated(bytes32 field, address indexed oldValue, address indexed newValue);

  /**
   * @notice Emitted when the contract receives ETH.
   * @param sender The address that sent the ETH.
   * @param amount The amount of ETH received.
   */
  event Received(address indexed sender, uint256 indexed amount);

  /**
   * @notice Emitted when a proxy contract is initialized.
   * @param proxy The address of the proxy contract.
   * @param withdrawal The withdrawal address used by the proxy.
   * @param owner The owner of the proxy.
   */
  event ProxyInitialized(address indexed proxy, address indexed withdrawal, address indexed owner);

  /**
   * @notice Emitted when the factory address is updated.
   * @param oldFactory The previous factory address.
   * @param newFactory The new factory address.
   */
  event UpdateFactory(address indexed oldFactory, address indexed newFactory);

  /**
   * @notice Emitted when a withdrawal is made from the contract.
   * @param token The address of the token being withdrawn (address(0) for ETH).
   * @param recipient The address receiving the withdrawn funds.
   * @param amount The amount withdrawn.
   */
  event Withdrawn(address indexed token, address indexed recipient, uint256 indexed amount);

  /**
   * @notice Emitted when the withdrawal address is updated.
   * @param old The previous withdrawal address.
   * @param newWithdrawal The new withdrawal address.
   */
  event WithdrawalUpdated(address indexed old, address indexed newWithdrawal);
}
