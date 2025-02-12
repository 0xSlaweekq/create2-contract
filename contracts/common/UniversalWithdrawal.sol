// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import {LibErrors} from "../utils/LibErrors.sol";
import {IEvents} from "../utils/IEvents.sol";

/**
 * @title UniversalWithdrawal
 * @dev Logic contract that allows withdrawal and transfers of ERC20 tokens and Ether.
 *      Includes functionality for safe transfers, batch transfers, and withdrawals.
 *      The owner and factory can interact with it for various operations.
 */
contract UniversalWithdrawal is ReentrancyGuard, IEvents {
    using Address for address;
    using Address for address payable;
    using SafeERC20 for IERC20;

    /// @notice Enum for transfer types.
    enum TransferType {
        Transfer,
        SafeTransfer,
        SafeTransferCustom
    }

    /**
     * @notice Fallback function to receive ETH.
     * @dev Emits a `Received` event for logging received ETH.
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @notice Transfers tokens or Ether to the specified address.
     * @param token The address of the token (use address(0) for Ether).
     * @param to The address of the recipient.
     * @param amount The amount of tokens or Ether to transfer.
     * @param transferType The type of transfer (normal, safe, or custom).
     * @dev This function requires the caller to be the owner.
     */
    function universalTransfer(
        address token,
        address to,
        uint256 amount,
        TransferType transferType
    ) external nonReentrant returns (bool) {
        if (token == address(0)) {
            if (amount == 0 || to == address(0)) revert LibErrors.InvalidTransferParameters();
            payable(to).sendValue(amount);
        } else {
            IERC20 erc20 = IERC20(token);

            if (transferType == TransferType.Transfer) {
                require(erc20.transfer(to, amount), "ERC20 transfer failed");
            } else if (transferType == TransferType.SafeTransfer) {
                erc20.safeTransfer(to, amount);
            } else if (transferType == TransferType.SafeTransferCustom) {
                if (!_withdrawERC20(token, to, amount)) revert LibErrors.WithdrawERC20Failed(token, amount);
            } else {
                revert LibErrors.UnsupportedTransferType();
            }
        }

        emit Withdrawn(token, to, amount);

        return true;
    }

    /**
     * @notice Withdraws ETH to multiple recipients.
     * @param recipients Array of recipient addresses.
     * @param amounts Array of amounts to send to each recipient.
     */
    function withdraw(
        address payable[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant returns (bool) {
        uint256 length = recipients.length;
        if (length == 0) revert LibErrors.ArrayRecipientsCantBeZero();
        if (length != amounts.length) revert LibErrors.ArrayLengthMismatch();

        for (uint256 i = 0; i < length; ) {
            uint256 amount = amounts[i];
            uint256 contractBalance = address(this).balance;
            if (contractBalance < amount) revert LibErrors.InsufficientBalance(contractBalance, amount);

            address payable recipient = recipients[i];
            if (recipient == address(0)) revert LibErrors.InvalidAddressRecipient();

            recipient.sendValue(amount);
            emit Withdrawn(address(0), recipient, amount);

            unchecked {
                ++i;
            }
        }
        return true;
    }

    /**
     * @notice Performs a custom ERC20 withdrawal to the recipient.
     * @param token The token to withdraw.
     * @param recipient The address to send the tokens to.
     * @param amount The amount of tokens to withdraw.
     * @dev Can only be called by the owner.
     */
    function withdrawERC20(address token, address recipient, uint256 amount) external nonReentrant returns (bool) {
        if (!_withdrawERC20(token, recipient, amount)) revert LibErrors.WithdrawERC20Failed(token, amount);

        emit Withdrawn(token, recipient, amount);
        return true;
    }

    /**
     * @notice Withdraws multiple ERC20 tokens to multiple recipients.
     * @param tokens Array of token addresses.
     * @param recipients Array of recipient addresses.
     * @param amounts Array of amounts to withdraw for each token.
     */
    function withdrawManyERC20(
        address[] calldata tokens,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant returns (bool) {
        uint256 length = tokens.length;
        if (length != recipients.length || length != amounts.length) revert LibErrors.ArrayLengthMismatch();

        for (uint256 i = 0; i < length; ) {
            address token = tokens[i];
            uint256 amount = amounts[i];

            if (!_withdrawERC20(token, recipients[i], amount)) revert LibErrors.WithdrawERC20Failed(token, amount);

            emit Withdrawn(token, recipients[i], amount);

            unchecked {
                ++i;
            }
        }
        return true;
    }

    /**
     * @notice Withdraw assets from clones initiated by the factory.
     * @param token The address of the token to withdraw (or zero for ETH).
     * @param recipient The address receiving the assets.
     * @param amount The amount to withdraw.
     * @dev Only callable by the factory.
     */
    function withdrawFactory(address token, address recipient, uint256 amount) external nonReentrant returns (bool) {
        if (token == address(0)) {
            payable(recipient).sendValue(amount);
        } else {
            if (!_withdrawERC20(token, recipient, amount)) revert LibErrors.WithdrawERC20Failed(token, amount);
        }

        emit Withdrawn(token, recipient, amount);

        return true;
    }

    /**
     * @notice Internal function to withdraw ERC20 tokens.
     * @param token The address of the token to withdraw.
     * @param to The recipient address.
     * @param amount The amount to withdraw.
     * @return success True if the withdrawal was successful.
     */
    function _withdrawERC20(address token, address to, uint256 amount) private returns (bool) {
        if (token == address(0)) revert LibErrors.InvalidAddressToken();
        if (to == address(0)) revert LibErrors.InvalidAddressRecipient();

        (bool success, bytes memory result) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        return success && (result.length == 0 || abi.decode(result, (bool)));
    }
}
