// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Admin, Address, LibAdmin, LibErrors} from "../utils/Admin.sol";

/**
 * @title UpgradeableProxy
 * @dev A proxy contract that forwards calls to an implementation (withdrawal) address.
 *      The implementation address can be updated by the owner.
 */
contract UpgradeableProxy is Admin {
    using Address for address;

    /**
     * @notice Fallback function to handle ETH transfers.
     * @dev Emits a `Received` event for logging received ETH.
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @notice Fallback function to delegate calls to the withdrawal implementation.
     * @dev This function delegates all calls to the withdrawal address using `_delegate`.
     */
    fallback() external payable {
        LibAdmin._checkAdmin(msg.sender);
        _delegate();
    }

    /**
     * @notice Initializes the proxy with the withdrawal implementation and sets the owner.
     * @param owner_ The address of the owner.
     * @param factory_ The address of the factory contract.
     * @param withdrawal_ The address of the withdrawals contract for proxy.
     * @dev Can only be called once. Emits a `ProxyInitialized` event.
     */
    function initProxy(address owner_, address factory_, address withdrawal_) external returns (bool) {
        super._initAdmin(owner_, factory_, withdrawal_);
        LibAdmin._checkFactory(msg.sender);

        emit ProxyInitialized(address(this), withdrawal_, owner_);
        return true;
    }

    /**
     * @notice Delegates the current call to the withdrawal implementation.
     * @dev Private function that delegates the call using inline assembly.
     */
    function _delegate() private {
        address impl = LibAdmin._storage().withdrawal;
        if (impl == address(0)) revert LibErrors.InvalidAddressWithdrawal();

        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
