import axios from 'axios'
import { config } from 'dotenv'
import { ethers } from 'hardhat'
import { TronWeb } from 'tronweb'

config()

const tronWeb = new TronWeb({
  fullHost: (process.env.NILE_RPC_URL as string) || '',
  privateKey: (process.env.NILE_PRIVATE_KEY as string) || '',
})
const ADDRESS_PREFIX_REGEX = /^(41)/

/**
 * Encodes parameters for a smart contract call.
 * @param inputs - an array of objects with type and value.
 * @returns encoded parameters as a string.
 */
function encodeParams(inputs: { type: string; value: any }[]): string {
  let parameters = ''

  if (inputs.length === 0) {
    return parameters
  }

  const abiCoder = new ethers.AbiCoder()
  const types: string[] = []
  const values: any[] = []

  for (let { type, value } of inputs) {
    if (type === 'address') {
      value = value.replace(ADDRESS_PREFIX_REGEX, '0x')
    } else if (type === 'address[]') {
      value = value.map((v: string) => tronWeb.address.toHex(v).replace(ADDRESS_PREFIX_REGEX, '0x'))
    }
    types.push(type)
    values.push(value)
  }

  console.log(types, values)

  try {
    parameters = abiCoder.encode(types, values).replace(/^(0x)/, '')
  } catch (e) {
    console.error('Encoding parameters failed:', e)
  }

  return parameters
}

/**
 * Executes a transaction through a smart contract.
 * @param owner - the owner's address.
 * @param contract - the contract's address.
 * @param method - the function selector.
 * @param params - the call parameters.
 */
async function broadcastTx(owner: string, contract: string, method: string, params: string): Promise<void> {
  try {
    const privateKey = (process.env.TRON_PRIVATE_KEY as string) || ''
    const triggerContractBody = {
      contract_address: contract,
      owner_address: owner,
      function_selector: method,
      parameter: params,
      call_value: 0,
      fee_limit: 306_000_000,
    }

    // Sending contract call
    const triggerResult = await axios.post(`${process.env.TRON_RPC_URL}/wallet/triggersmartcontract`, triggerContractBody)
    console.dir({ triggerResult: triggerResult.data }, { depth: 10 })

    const transaction = triggerResult.data.transaction

    // Signing the transaction
    const signedTxn = await tronWeb.trx.sign(transaction, privateKey)
    console.dir({ signedTxn }, { depth: 10 })

    const result = {
      transaction,
      receipt: await tronWeb.trx.sendRawTransaction(transaction),
    }
    console.log(result)

    // Broadcasting the transaction to the TRON network
    const broadcastResponse = (await axios.post(`${process.env.TRON_RPC_URL}/wallet/broadcasttransaction`, signedTxn)).data

    console.log('Transaction broadcasted successfully:', broadcastResponse)
  } catch (e) {
    console.error('Failed to trigger smart contract:', e)
  }
}

async function main(): Promise<void> {
  try {
    const contractAddress = 'TA5DACkkZECFGSWqb79wXA5K9ThEtHNXGb'
    const receiverAddress = 'TNrcb4AKHwAuCKUoXccGZCgRhr8bq6ELyS'
    const tokenAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
    const ownerAddress = 'TUDYX7SoHjbBJZ4Xap73iB44Mu3xbUo4qs'

    const parameterToken = encodeParams([
      { type: 'address', value: tronWeb.address.toHex(tokenAddress) },
      { type: 'uint256', value: 3199998 },
      { type: 'address', value: tronWeb.address.toHex(receiverAddress) },
    ])

    const parameterTron = encodeParams([
      { type: 'uint256', value: 3199999 },
      { type: 'address', value: tronWeb.address.toHex(receiverAddress) },
    ])

    // withdraw tron
    // await broadcastTx(
    //   tronWeb.address.toHex(ownerAddress),
    //   tronWeb.address.toHex(contractAddress),
    //   "withdraw(uint256,address)",
    //   parameterTron
    // );

    // withdraw tokens
    await broadcastTx(
      tronWeb.address.toHex(ownerAddress),
      tronWeb.address.toHex(contractAddress),
      'withdrawERC20(address,uint256,address)',
      parameterToken,
    )
    process.exit(0)
  } catch (e) {
    console.error('Error in main function:', e)
    process.exit(1)
  }
}

main()
