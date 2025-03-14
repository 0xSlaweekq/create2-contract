// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {LibErrors} from "./LibErrors.sol";
import {IEvents} from "./IEvents.sol";

/**
 * @title LibAdmin
 * @dev A library for managing admin roles, ownership, and key configuration fields. This library provides reusable
 *      storage access and validation methods for roles and permissions.
 */
library LibAdmin {
  using Address for address;

  /**
   * @dev Storage structure for admin-related data.
   * @param owner The address of the owner.
   * @param factory The address of the factory contract.
   * @param withdrawal The address of the withdrawals contract for proxy.
   * @param admins A mapping of addresses with admin privileges.
   */
  struct Storage {
    address owner;
    address factory;
    address withdrawal;
    mapping(address => bool) admins;
  }

  /**
   * @dev Enum representing fields that can be updated via `_updateField`.
   */
  enum Field {
    Factory,
    Withdrawal
  }

  /// @dev The storage slot used for storing the admin-related data.
  bytes32 private constant STORAGE_SLOT = keccak256("create2.admin.storage");

  /**
   * @notice Initializes the admin system with specified owner, factory, and withdrawal addresses.
   * @param owner_ The address of the owner.
   * @param factory_ The address of the factory contract.
   * @param withdrawal_ The address of the withdrawals contract for proxy.
   * @dev Emits `AdminInitialized` event.
   */
  function _initialize(address owner_, address factory_, address withdrawal_) internal {
    if (owner_ == address(0)) revert LibErrors.InvalidAddressOwner();
    if (factory_ == address(0)) revert LibErrors.InvalidAddressFactory();
    if (withdrawal_ == address(0)) revert LibErrors.InvalidAddressWithdrawal();

    Storage storage s = _storage();

    s.owner = owner_;
    s.factory = factory_;
    s.withdrawal = withdrawal_;
    s.admins[owner_] = true;
    s.admins[factory_] = true;

    emit IEvents.AdminInitialized(owner_, factory_, withdrawal_);
  }

  /**
   * @notice Updates admin privileges for a list of accounts.
   * @param accounts_ The list of accounts to update.
   * @param isAdmin_ True to grant admin rights, false to revoke.
   * @return True if the operation is successful.
   * @dev Emits `AdminStatusChanged` for each account updated.
   * @dev Reverts with `CannotRemoveOwner` if attempting to revoke admin rights from the owner.
   */
  function _setAdmin(address[] calldata accounts_, bool isAdmin_) internal returns (bool) {
    uint256 length = accounts_.length;
    if (length == 0) revert LibErrors.ArrayAccountsCantBeZero();

    Storage storage s = _storage();

    for (uint256 i = 0; i < length; ) {
      address account = accounts_[i];
      if (account == address(0)) revert LibErrors.InvalidAddressAdmin();

      if (account == s.owner && !isAdmin_) revert LibErrors.CannotRemoveOwner();

      if (s.admins[account] != isAdmin_) {
        s.admins[account] = isAdmin_;
        emit IEvents.AdminStatusChanged(account, isAdmin_);
      }

      unchecked {
        ++i;
      }
    }

    return true;
  }

  /**
   * @notice Updates a specific field (factory or withdrawal).
   * @param newValue_ The new address value for the field.
   * @param field The field to update (Factory or Withdrawal).
   * @return True if the update is successful.
   * @dev Emits `FieldUpdated` event on success.
   * @dev Reverts with `InvalidAddressField` for an invalid address or `InvalidField` for an unknown field.
   */
  function _updateField(address newValue_, Field field) internal returns (bool) {
    if (newValue_ == address(0)) revert LibErrors.InvalidAddressField();

    Storage storage s = _storage();
    address oldValue;

    if (field == Field.Factory) {
      oldValue = s.factory;
      s.factory = newValue_;
    } else if (field == Field.Withdrawal) {
      oldValue = s.withdrawal;
      s.withdrawal = newValue_;
    } else {
      revert LibErrors.InvalidField(keccak256(abi.encodePacked(field)));
    }

    emit IEvents.FieldUpdated(keccak256(abi.encodePacked(field)), oldValue, newValue_);
    return true;
  }

  /**
   * @notice Validates that the caller is the owner.
   * @param owner_ The address to validate as the owner.
   * @dev Reverts with `OnlyOwner` if the validation fails.
   */
  function _checkOwner(address owner_) internal view {
    if (_owner() != owner_) revert LibErrors.OnlyOwner(owner_);
  }

  /**
   * @notice Validates that the caller is the factory.
   * @param factory_ The address to validate as the factory.
   * @dev Reverts with `OnlyFactory` if the validation fails.
   */
  function _checkFactory(address factory_) internal view {
    if (_factory() != factory_) revert LibErrors.OnlyFactory(factory_);
  }

  /**
   * @notice Validates that the caller is an admin.
   * @param admin_ The address to validate as an admin.
   * @dev Reverts with `OnlyAdmin` if the validation fails.
   */
  function _checkAdmin(address admin_) internal view {
    if (!_isAdmined(admin_)) revert LibErrors.OnlyAdmin(admin_);
  }

  /**
   * @notice Returns the owner of the system.
   * @return The address of the current owner.
   */
  function _owner() internal view returns (address) {
    return _storage().owner;
  }

  /**
   * @notice Returns the factory address.
   * @return The address of the factory contract.
   */
  function _factory() internal view returns (address) {
    return _storage().factory;
  }

  /**
   * @notice Returns the withdrawal address.
   * @return The address used for withdrawals.
   */
  function _withdrawal() internal view returns (address) {
    return _storage().withdrawal;
  }
  /**
   * @notice Checks if an account has admin privileges.
   * @param account_ The account to check.
   * @return True if the account is an admin, otherwise false.
   */
  function _isAdmined(address account_) internal view returns (bool) {
    return _storage().admins[account_];
  }

  /**
   * @notice Returns the storage structure for admin-related data.
   * @return s The `Storage` structure for managing admin data.
   */
  function _storage() internal pure returns (Storage storage s) {
    bytes32 slot = STORAGE_SLOT;
    assembly {
      s.slot := slot
    }
  }
}
