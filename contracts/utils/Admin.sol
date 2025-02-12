// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {LibAdmin, IEvents, LibErrors} from "./LibAdmin.sol";

/**
 * @title Admin
 * @dev This contract manages access control for the system by leveraging the LibAdmin library.
 * It provides functionality for owner, factory, and admin roles, as well as updating key configuration fields.
 */
contract Admin is Initializable, IEvents {
    using Address for address;

    /**
     * @dev Modifier to restrict access to the owner of the contract.
     */
    modifier onlyOwner() {
        LibAdmin._checkOwner(msg.sender);
        _;
    }

    /**
     * @notice Sets admin status for a list of accounts.
     * @dev Only the owner can call this function.
     * Emits an event for each account's admin status change.
     * @param accounts_ List of addresses to update admin status for.
     * @param isAdmin_ True to grant admin rights, false to revoke.
     * @return True if the operation is successful.
     */
    function setAdmin(address[] calldata accounts_, bool isAdmin_) public onlyOwner returns (bool) {
        return LibAdmin._setAdmin(accounts_, isAdmin_);
    }

    /**
     * @notice Updates the factory address.
     * @dev Only the owner can call this function.
     * Emits a `FieldUpdated` event upon success.
     * @param factory_ New address for the factory.
     * @return True if the operation is successful.
     */
    function updateFactory(address factory_) public onlyOwner returns (bool) {
        return LibAdmin._updateField(factory_, LibAdmin.Field.Factory);
    }

    /**
     * @notice Updates the withdrawal address.
     * @dev Only the owner can call this function.
     * Emits a `FieldUpdated` event upon success.
     * @param withdrawal_ New address for withdrawals.
     * @return True if the operation is successful.
     */
    function updateWithdrawal(address withdrawal_) public onlyOwner returns (bool) {
        return LibAdmin._updateField(withdrawal_, LibAdmin.Field.Withdrawal);
    }

    /**
     * @notice Returns the owner of the contract.
     * @dev This function fetches the owner from the LibAdmin storage.
     * @return Address of the current owner.
     */
    function owner() public view returns (address) {
        return LibAdmin._owner();
    }

    /**
     * @notice Returns the factory address.
     * @dev This function fetches the factory address from the LibAdmin storage.
     * @return Address of the current factory.
     */
    function factory() public view returns (address) {
        return LibAdmin._factory();
    }

    /**
     * @notice Returns the withdrawal address.
     * @dev This function fetches the withdrawal address from the LibAdmin storage.
     * @return Address of the current withdrawal.
     */
    function withdrawal() public view returns (address) {
        return LibAdmin._withdrawal();
    }

    /**
     * @notice Checks if an account is an admin.
     * @param account_ The address to check for admin status.
     * @return True if the account is an admin, otherwise false.
     */
    function isAdmined(address account_) public view returns (bool) {
        return LibAdmin._isAdmined(account_);
    }

    /**
     * @dev Initializes the Admin contract with owner, factory, and withdrawal addresses.
     * @param owner_ Address of the contract owner.
     * @param factory_ Address of the factory contract.
     * @param withdrawal_ Address for withdrawal of funds.
     */
    function _initAdmin(address owner_, address factory_, address withdrawal_) internal initializer {
        LibAdmin._initialize(owner_, factory_, withdrawal_);
    }
}
