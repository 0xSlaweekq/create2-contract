// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Admin, Address, LibErrors, LibAdmin} from "../utils/Admin.sol";
import {UpgradeableProxy} from "./UpgradeableProxy.sol";
import {TronClones} from "../utils/TronClones.sol";

interface IWithdrawable {
  /**
   * @notice Withdraws specified tokens from the clone contract to a recipient.
   * @param token Address of the token to withdraw (address(0) for ETH).
   * @param recipient Address of the recipient.
   * @param amount Amount of tokens to withdraw.
   * @return success True if the withdrawal is successful.
   */
  function withdrawFactory(address token, address recipient, uint256 amount) external returns (bool success);
}

/**
 * @title TronUniversalFactory
 * @dev A contract for creating and managing clones of a proxy contract with deterministic addresses.
 *      Extends the Admin contract for access control and withdrawal management.
 */
contract TronUniversalFactory is Admin {
  using Address for address;

  /// @notice Address of the proxy contract used as the implementation for clones.
  address public immutable PROXY;

  /**
   * @notice Constructor that initializes the factory contract.
   * @param withdrawal_ The address used for withdrawals.
   */
  constructor(address withdrawal_) {
    super._initAdmin(msg.sender, address(this), withdrawal_);
    address proxy = address(new UpgradeableProxy());
    if (proxy == address(0)) revert LibErrors.CreatedProxyFailed();
    PROXY = proxy;
  }

  /**
   * @notice Fallback function to receive ETH.
   * @dev Emits a `Received` event for logging received ETH.
   */
  receive() external payable {
    emit Received(msg.sender, msg.value);
  }

  /**
   * @notice Creates a deterministic clone of the proxy contract.
   * @param _salt Unique salt used for deterministic address generation.
   * @return cloneAddress The address of the created clone.
   * @dev Emits `CloneCreated` event upon success.
   */
  function createClone(bytes32 _salt) external onlyOwner returns (address cloneAddress) {
    // Access withdrawal from the storage
    address withdrawal_ = LibAdmin._storage().withdrawal;

    // Create a deterministic clone of the proxy contract
    cloneAddress = TronClones.cloneDeterministic(PROXY, _salt);
    if (cloneAddress == address(0)) revert LibErrors.CreatedCloneFailed();

    UpgradeableProxy(payable(cloneAddress)).initProxy(msg.sender, address(this), withdrawal_);

    // Emit an event for clone creation
    emit CloneCreated(cloneAddress, withdrawal_, owner());
  }

  /**
   * @notice Withdraws assets from multiple clones to a recipient.
   * @param clones Array of clone addresses.
   * @param amounts Array of amounts to withdraw from each clone.
   * @param recipient The address receiving the withdrawn funds.
   * @param token Address of the token to withdraw (address(0) for ETH).
   * @dev Emits a `Withdrawn` event for each withdrawal.
   */
  function withdrawAssetsFromClones(
    address[] calldata clones,
    uint256[] calldata amounts,
    address recipient,
    address token
  ) external onlyOwner {
    if (recipient == address(0)) revert LibErrors.InvalidAddressRecipient();
    uint256 length = clones.length;
    if (length == 0 || length != amounts.length) revert LibErrors.ArrayLengthMismatch();

    for (uint256 i = 0; i < length; ) {
      address cloneAddress = clones[i];
      if (cloneAddress == address(0)) revert LibErrors.InvalidAddressClone();

      try IWithdrawable(cloneAddress).withdrawFactory(token, recipient, amounts[i]) returns (bool success) {
        if (!success) revert LibErrors.WithdrawFailed(recipient, amounts[i]);
      } catch {
        revert LibErrors.WithdrawFailed(recipient, amounts[i]);
      }

      unchecked {
        ++i;
      }
    }
  }

  /**
   * @notice Predicts the address of a deterministic clone before it is created.
   * @param _salt The salt used for address generation.
   * @return predictedAddress The predicted address of the clone.
   */
  function predictAddress(bytes32 _salt) external view returns (address predictedAddress) {
    return TronClones.predictDeterministicAddress(PROXY, _salt, address(this));
  }
}
