import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { TronWeb } from "tronweb"
/**
 * @title Enums for Withdrawal Methods and Function Selectors
 * @dev Enumerations and type definitions for managing withdrawal methods and related function selectors.
 */

/**
 * @enum GetFunctionDataType
 * @dev Defines types for encoding and decoding function data.
 * - `decode`: Decodes data from a transaction or call.
 * - `encode`: Encodes input data for a transaction or call.
 */
export enum GetFunctionDataType {
    "decode" = "decode",
    "encode" = "encode",
}

/**
 * @enum WithdrawalMethods
 * @dev Enumeration for all withdrawal method names.
 * - `universalTransfer`: General-purpose transfer of tokens or Ether.
 * - `withdraw`: Withdraw Ether to multiple recipients.
 * - `withdrawERC20`: Withdraw ERC20 tokens to a recipient.
 * - `withdrawFactory`: Factory-initiated withdrawal.
 * - `withdrawManyERC20`: Batch withdrawal of ERC20 tokens to multiple recipients.
 */
export enum WithdrawalMethods {
    "universalTransfer" = "universalTransfer",
    "withdraw" = "withdraw",
    "withdrawERC20" = "withdrawERC20",
    "withdrawFactory" = "withdrawFactory",
    "withdrawManyERC20" = "withdrawManyERC20",
}

/**
 * @enum WithdrawalFunctionSelector
 * @dev Maps function selectors to their ABI definitions.
 * - Function selectors align with the ABI definition for each withdrawal method.
 */
export enum WithdrawalFunctionSelector {
    "universalTransfer" = "universalTransfer(address,address,uint256,uint8)",
    "withdraw" = "withdraw(address[],uint256[])",
    "withdrawERC20" = "withdrawERC20(address,address,uint256)",
    "withdrawFactory" = "withdrawFactory(address,address,uint256)",
    "withdrawManyERC20" = "withdrawManyERC20(address[],address[],uint256[])",
}

/**
 * @title Data Transfer Objects (DTOs) for Universal Withdrawal Operations
 * @dev Type definitions for structured data input to withdrawal operations.
 */

/**
 * @typedef UniversalTransferDto
 * @dev Represents the input data for a universal transfer.
 * - `method`: The withdrawal method being used.
 * - `data`: Contains transfer parameters (token, recipient, amount, transfer type).
 */
export type UniversalTransferDto = {
    method: WithdrawalMethods.universalTransfer
    data: {
        [Names.token]: string
        [Names.to]: string
        [Names.amount]: number
        [Names.transferType]: string
    }
}

/**
 * @typedef WithdrawDto
 * @dev Represents the input data for a bulk Ether withdrawal.
 * - `method`: The withdrawal method being used.
 * - `data`: Contains recipients and amounts.
 */
export type WithdrawDto = {
    method: WithdrawalMethods.withdraw
    data: {
        [Names.recipients]: string[]
        [Names.amounts]: number[]
    }
}

/**
 * @typedef WithdrawERC20Dto
 * @dev Represents the input data for a single ERC20 token withdrawal.
 * - `method`: The withdrawal method being used.
 * - `data`: Contains token address, recipient, and amount.
 */
export type WithdrawERC20Dto = {
    method: WithdrawalMethods.withdrawERC20
    data: {
        [Names.token]: string
        [Names.recipient]: string
        [Names.amount]: number
    }
}

/**
 * @typedef WithdrawFactoryDto
 * @dev Represents the input data for a factory-initiated withdrawal.
 * - `method`: The withdrawal method being used.
 * - `data`: Contains token address, recipient, and amount.
 */
export type WithdrawFactoryDto = {
    method: WithdrawalMethods.withdrawFactory
    data: {
        [Names.token]: string
        [Names.recipient]: string
        [Names.amount]: number
    }
}

/**
 * @typedef WithdrawManyERC20Dto
 * @dev Represents the input data for batch ERC20 token withdrawals.
 * - `method`: The withdrawal method being used.
 * - `data`: Contains arrays of token addresses, recipients, and amounts.
 */
export type WithdrawManyERC20Dto = {
    method: WithdrawalMethods.withdrawManyERC20
    data: {
        [Names.tokens]: string[]
        [Names.recipients]: string[]
        [Names.amounts]: number[]
    }
}

/**
 * @typedef SelectorTypes
 * @dev Represents a mapping of function names and types for selectors.
 * - `name`: The name of the function parameter.
 * - `type`: The type of the parameter (e.g., `address`, `uint256`).
 */
export type SelectorTypes = {
    name: Names
    type: string
}

/**
 * @typedef ArgsType
 * @dev Represents a single argument used in a function selector.
 * - `type`: The type of the argument (e.g., `string`, `number`).
 * - `value`: The value of the argument.
 */
export type ArgsType = {
    type: string
    value: any | number | string | number[] | string[]
}

/**
 * @typedef DataType
 * @dev Represents structured data for calling a withdrawal function.
 * - `functionSelector`: The ABI definition of the function selector.
 * - `args`: The arguments for the function.
 */
export type DataType = {
    functionSelector: WithdrawalFunctionSelector
    args: ArgsType[]
}

/**
 * @enum Names
 * @dev Enumeration for parameter names used across withdrawal operations.
 * - `token`: Address of the token for the operation.
 * - `tokens`: Array of token addresses for batch operations.
 * - `to`: Address of the recipient for a transfer.
 * - `recipient`: Address of the recipient for a withdrawal.
 * - `recipients`: Array of recipient addresses for batch withdrawals.
 * - `amount`: Amount to transfer or withdraw.
 * - `amounts`: Array of amounts for batch operations.
 * - `transferType`: Type of transfer being performed (normal, safe, or custom).
 */
export enum Names {
    "token" = "token",
    "tokens" = "tokens",
    "to" = "to",
    "recipient" = "recipient",
    "recipients" = "recipients",
    "amount" = "amount",
    "amounts" = "amounts",
    "transferType" = "transferType",
}

/**
 * @typedef GetSelectorTypes
 * @dev Represents a mapping of withdrawal methods to their respective function selectors and parameter types.
 * - `universalTransfer`: Selector types for the universal transfer function.
 * - `withdraw`: Selector types for the bulk Ether withdrawal function.
 * - `withdrawERC20`: Selector types for the ERC20 withdrawal function.
 * - `withdrawFactory`: Selector types for factory-initiated withdrawals.
 * - `withdrawManyERC20`: Selector types for batch ERC20 withdrawals.
 */
export type GetSelectorTypes = {
    [WithdrawalMethods.universalTransfer]: SelectorTypes[]
    [WithdrawalMethods.withdraw]: SelectorTypes[]
    [WithdrawalMethods.withdrawERC20]: SelectorTypes[]
    [WithdrawalMethods.withdrawFactory]: SelectorTypes[]
    [WithdrawalMethods.withdrawManyERC20]: SelectorTypes[]
}

/**
 * @typedef CallProxyTronDto
 * @dev Represents input data for calling a proxy contract on Tron.
 * - `tronWeb`: TronWeb instance for the transaction.
 * - `proxyAddress`: Address of the proxy contract.
 * - `getDataInput`: Structured input data for the call.
 * - `allowThrow`: Optional flag to suppress errors.
 */
export type CallProxyTronDto = {
    tronWeb: TronWeb
    proxyAddress: string
    getDataInput: UniversalTransferDto | WithdrawDto | WithdrawERC20Dto | WithdrawFactoryDto | WithdrawManyERC20Dto
    allowThrow?: boolean
}

/**
 * @typedef CallProxyDto
 * @dev Represents input data for calling a proxy contract.
 * - `owner`: The owner initiating the call.
 * - `proxyAddress`: Address of the proxy contract.
 * - `data`: Encoded function data for the call.
 * - `allowThrow`: Optional flag to suppress errors.
 */
export type CallProxyDto = {
    owner: SignerWithAddress
    proxyAddress: string
    data: string
    allowThrow?: boolean
}

/**
 * @typedef GetErrorDto
 * @dev Represents structured data for error handling.
 * - `e`: The error object.
 * - `allowThrow`: Optional flag to suppress error propagation.
 */
export type GetErrorDto = {
    e: any
    allowThrow?: boolean
}

/**
 * @typedef GetFunctionDataDto
 * @dev Represents input for encoding or decoding function data.
 * - `method`: The withdrawal method.
 * - `data`: The structured data to encode or decode.
 * - `type`: The type of operation (`encode` or `decode`).
 */
export type GetFunctionDataDto = {
    method: WithdrawalMethods
    data: any
    type?: GetFunctionDataType
}

/**
 * @typedef GetDataDto
 * @dev Union type representing input data for all withdrawal operations.
 */
export type GetDataDto = UniversalTransferDto | WithdrawDto | WithdrawERC20Dto | WithdrawFactoryDto | WithdrawManyERC20Dto | any
