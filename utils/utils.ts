import { TransactionResponse } from "ethers"
import fs from "fs"
import hre from "hardhat"
import { resolve } from "path"
import { utils as TronWebUtils } from "tronweb"
import { BroadcastReturn, SignedTransaction } from "tronweb/lib/esm/types"

import {
    ArgsType,
    CallProxyDto,
    CallProxyTronDto,
    DataType,
    GetDataDto,
    GetErrorDto,
    GetFunctionDataDto,
    GetFunctionDataType,
    Names,
    SelectorTypes,
    WithdrawalFunctionSelector,
    WithdrawalMethods,
} from "./interfaces"

const withdrawalPath = "../tronbox/build/UniversalWithdrawal.json"

/**
 * @notice Handles errors thrown during function execution.
 * @param e - The error object.
 * @param allowThrow - Whether to rethrow the error (default: true).
 * @returns Decoded error data if allowThrow is false.
 */
const getError = async ({ e, allowThrow = true }: GetErrorDto) => {
    const { ethers, run } = hre
    const err = e.error
    let isCustomError = false
    let error_message = e

    if (err?.message || e?.message) {
        error_message = err?.message || e?.message
        isCustomError = error_message.includes("custom error") || error_message.includes("execution reverted:")
    }

    if (isCustomError) {
        const error_data = e?.data
        if (error_data) {
            const ABI_ETH = await run("gen-abi")
            const contractsInterfaces = new ethers.Interface(ABI_ETH)

            const decoded_error = contractsInterfaces.parseError(error_data)
            error_message = {
                error_data,
                name: decoded_error?.name,
                args: decoded_error?.args,
            }
        }
    }
    console.log("From getError:", error_message)

    if (allowThrow) {
        throw new Error(e)
    } else {
        return e
    }

    // const error_selector = ethers.utils.hexDataSlice(error_data, 0, 4);
    // const error_fragment = contractsInterfaces.getError(error_selector);
    // console.error({ error_selector, error_fragment });
}

/**
 * @notice Encodes parameters into a hexadecimal string.
 * @param types - An array of parameter types.
 * @param values - An array of parameter values.
 * @returns A hexadecimal string without the "0x" prefix.
 */
const encoder = (types: string[], values: any[]): string => {
    const { ethers } = hre
    const abiCoder = new ethers.AbiCoder()
    const encodedParams = abiCoder.encode(types, values)
    return encodedParams.slice(2)
}

/**
 * @notice Generates a Create2 address.
 * @param factoryAddress - The factory contract address.
 * @param saltHex - The hex-encoded salt.
 * @param initCode - The initialization code of the contract.
 * @returns The generated Create2 address.
 */
const create2Address = (factoryAddress: string, saltHex: string, initCode: string): string => {
    const { ethers } = hre
    return ethers.getCreate2Address(factoryAddress, saltHex, ethers.keccak256(initCode))
}

/**
 * @notice Suspends execution for the specified duration.
 * @param ms - The delay in milliseconds.
 */
const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms))

/**
 * @notice Sends a transaction to a proxy contract.
 * @param CallProxyDto - Contains the transaction details.
 * @returns The transaction response.
 */
const callProxy = async ({ owner, proxyAddress, data, allowThrow = true }: CallProxyDto): Promise<TransactionResponse> => {
    let tx: TransactionResponse

    if (!allowThrow) {
        tx = await owner.sendTransaction({ to: proxyAddress, data })
    } else {
        tx = (await owner.sendTransaction({ to: proxyAddress, data }).catch(async (e: any) => {
            await getError({ e, allowThrow })
            return e
        })) as TransactionResponse
    }

    return tx
}

/**
 * @notice Encodes or decodes function data.
 * @param GetFunctionDataDto - Contains the method, data, and operation type (encode/decode).
 * @returns Encoded or decoded function data.
 */
const getFunctionData = async ({ method, data, type = GetFunctionDataType.encode }: GetFunctionDataDto): Promise<string | any[]> => {
    const withdrawalAbi = JSON.parse(fs.readFileSync(resolve(__dirname, withdrawalPath)).toString()).abi
    const withdrawFunctionABI: any = withdrawalAbi.find((item: any) => item.name === method)

    if (!withdrawFunctionABI) {
        throw new Error(`ABI for function '${method}' not found.`)
    }

    switch (type) {
        case GetFunctionDataType.encode:
            return TronWebUtils.abi.encodeParamsV2ByABI(withdrawFunctionABI, data) as string
        case GetFunctionDataType.decode:
            return TronWebUtils.abi.decodeParamsV2ByABI(withdrawFunctionABI, data) as any[]
    }
}

/**
 * @notice Calls a proxy contract on the Tron network.
 * @param CallProxyTronDto - Contains the transaction details for Tron.
 * @returns The transaction receipt.
 */
const callProxyTron = async ({
    tronWeb,
    proxyAddress,
    getDataInput,
    allowThrow = true,
}: CallProxyTronDto): Promise<BroadcastReturn<SignedTransaction>> => {
    const { args, functionSelector } = getData(getDataInput)

    const unsignedTx = await tronWeb.transactionBuilder.triggerSmartContract(
        proxyAddress,
        functionSelector,
        {},
        args,
        tronWeb.defaultAddress.base58 as string,
    )
    const signedTx = await tronWeb.trx.signTransaction(unsignedTx.transaction)

    let receipt: BroadcastReturn<SignedTransaction>
    if (!allowThrow) {
        receipt = await tronWeb.trx.sendRawTransaction(signedTx)
    } else {
        receipt = await tronWeb.trx
            .sendRawTransaction(signedTx)
            .then(res => res)
            .catch(async (e: any) => {
                await getError({ e, allowThrow })
                return e
            })
    }

    // console.log("Transaction receipt:", receipt)
    return receipt
}

/**
 * @notice Retrieves function selector types for all methods.
 * @returns A mapping of withdrawal methods to their parameter types.
 */
const getSelectorsTypes = (): any[WithdrawalMethods] => {
    const withdrawalAbi: any[] = JSON.parse(fs.readFileSync(resolve(__dirname, withdrawalPath)).toString()).abi
    const functions = withdrawalAbi.filter(item => item.type === "function")
    const data: any[WithdrawalMethods] = []

    for (const func of functions as { name: WithdrawalMethods; inputs: SelectorTypes[] }[]) {
        const selectors: SelectorTypes[] = func.inputs.map(input => ({
            name: input.name,
            type: input.type,
        }))
        data[func.name] = selectors
    }

    return data
}

/**
 * @notice Generates data required for a function call.
 * @param GetDataDto - Contains the method and input data.
 * @returns Data for executing a function.
 */
function getData({ method, data }: GetDataDto): DataType {
    const sel: SelectorTypes[] = getSelectorsTypes()[method]
    const args: ArgsType[] = sel.map(s => ({
        type: s.type,
        value: data[s.name as Names],
    }))

    return {
        functionSelector: WithdrawalFunctionSelector[method as WithdrawalMethods],
        args,
    }
}
export { callProxy, callProxyTron, create2Address, encoder, getData, getError, getFunctionData, getSelectorsTypes, sleep }
