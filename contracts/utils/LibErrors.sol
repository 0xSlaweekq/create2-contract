// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title LibErrors
 * @dev This library defines custom errors used across the system, grouped by category for better organization.
 */
library LibErrors {
  // ========================
  // System errors
  // ========================
  error Revert43();

  // ========================
  // Address-related errors
  // ========================

  /**
   * @notice Thrown when an invalid admin address is provided.
   */
  error InvalidAddressAdmin();

  /**
   * @notice Thrown when an invalid clone address is provided.
   */
  error InvalidAddressClone();

  /**
   * @notice Thrown when an invalid factory address is provided.
   */
  error InvalidAddressFactory();

  /**
   * @notice Thrown when an invalid field address is provided.
   */
  error InvalidAddressField();

  /**
   * @notice Thrown when an invalid owner address is provided.
   */
  error InvalidAddressOwner();

  /**
   * @notice Thrown when an invalid recipient address is provided.
   */
  error InvalidAddressRecipient();

  /**
   * @notice Thrown when an invalid token address is provided.
   */
  error InvalidAddressToken();

  /**
   * @notice Thrown when an invalid withdrawal address is provided.
   */
  error InvalidAddressWithdrawal();

  // ========================
  // Access control errors
  // ========================

  /**
   * @notice Thrown when the caller is not an admin.
   */
  error OnlyAdmin(address caller);

  /**
   * @notice Thrown when the caller is not the factory.
   */
  error OnlyFactory(address caller);

  /**
   * @notice Thrown when the caller is not the owner.
   */
  error OnlyOwner(address caller);

  /**
   * @notice Thrown when attempting to remove the owner as an admin.
   */
  error CannotRemoveOwner();

  // ========================
  // Array-related errors
  // ========================

  /**
   * @notice Thrown when the length of two arrays does not match.
   */
  error ArrayLengthMismatch();

  /**
   * @notice Thrown when the array of accounts is empty.
   */
  error ArrayAccountsCantBeZero();

  /**
   * @notice Thrown when the array of recipients is empty.
   */
  error ArrayRecipientsCantBeZero();

  // ========================
  // Token and amount errors
  // ========================

  /**
   * @notice Thrown when the amount is zero or less.
   */
  error AmountMustBeGreaterThanZero();

  /**
   * @dev Error to be thrown when transfer parameters are invalid, such as zero amount or invalid address.
   */
  error InvalidTransferParameters();

  /**
   * @notice Thrown when the token amounts provided are zero.
   */
  error TokenAmountsCantBeZero();

  /**
   * @notice Thrown when the transfer type is unsupported.
   */
  error UnsupportedTransferType();

  /**
   * @notice Thrown when the universal transfer fails.
   */
  error UniversalTransferFailed(address token, address to, uint256 amount);

  /**
   * @notice Thrown when withdrawing ERC20 tokens fails.
   */
  error WithdrawERC20Failed(address token, uint256 amount);

  /**
   * @notice Thrown when a withdrawal fails.
   */
  error WithdrawFailed(address recipient, uint256 amount);

  // ========================
  // Clone-related errors
  // ========================

  /**
   * @notice Thrown when no clones are provided.
   */
  error NoClonesProvided();

  /**
   * @notice Thrown when the number of clones and amounts does not match.
   */
  error ClonesNotEqualAmounts();

  /**
   * @notice Thrown when the creation of a proxy contract fails.
   */
  error CreatedProxyFailed();

  /**
   * @notice Thrown when the creation of a clone contract fails.
   */
  error CreatedCloneFailed();

  // ========================
  // General errors
  // ========================

  /**
   * @notice Thrown when an invalid field is provided.
   */
  error InvalidField(bytes32 provided);

  /**
   * @notice Thrown when there is an insufficient balance for an operation.
   */
  error InsufficientBalance(uint256 balance, uint256 required);

  /**
   * @notice Thrown when withdrawal amounts do not match the expected total.
   */
  error WithdrawalNotEqual();
}
