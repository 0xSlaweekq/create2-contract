import axios from 'axios'
import { config } from 'dotenv'
import { ethers } from 'hardhat'
import { TronWeb } from 'tronweb'

import abi from '../build/abis/contracts/old/common/DefaultWithdrawal.sol/DefaultWithdrawal.json'
import { Blockchain, Network, tokensConfig, TokenType } from './config'

config()

const ADDRESS_PREFIX_REGEX = /^(41)/

type withdrawDto = {
  rpcUrl: string
  privateKey: string
  cloneAddress: string
  token: TokenType
  amount: string
  recipientAddress: string
}

async function withdrawEvm(dto: withdrawDto) {
  console.log('****** withdraw evm *******')
  console.dir(dto, { depth: 10 })
  const provider = new ethers.JsonRpcProvider(dto.rpcUrl)
  const signer = new ethers.Wallet(dto.privateKey, provider)

  const contract = new ethers.Contract(dto.cloneAddress, abi, signer)

  const amtToSend = ethers.parseUnits(dto.amount, 0)

  if (dto.token.native) {
    const ethTx = await contract.withdraw([amtToSend], [dto.recipientAddress])
    console.log('****** withdraw evm NATIVE start *******')
    console.log(ethTx)
    console.log(await ethTx.wait())
    console.log('****** withdraw evm NATIVE end *******')
  } else {
    console.log('****** withdraw evm ERC20 start *******')
    const erc20Tx = await contract.withdrawERC20([dto.token.address], [amtToSend], [dto.recipientAddress])
    console.log(erc20Tx)
    console.log(await erc20Tx.wait())
    console.log('****** withdraw evm ERC20 end *******')
  }
}

function encodeTronParams(inputs: { type: string; value: string | string[] }[], tronWeb: any): string {
  const typesValues = inputs
  let parameters = ''

  if (typesValues.length === 0) {
    return parameters
  }
  const abiCoder = new ethers.AbiCoder()
  const types: string[] = []
  const values: (string | string[])[] = []

  for (let i = 0; i < typesValues.length; i++) {
    let { type, value } = typesValues[i]
    if (type === 'address') {
      value = (value as string).replace(ADDRESS_PREFIX_REGEX, '0x')
    } else if (type === 'address[]') {
      value = (value as string[]).map(v => tronWeb.address.toHex(v).replace(ADDRESS_PREFIX_REGEX, '0x'))
    }
    types.push(type)
    values.push(value)
  }

  console.log(types, values)
  parameters = abiCoder.encode(types, values).replace(/^(0x)/, '')
  return parameters
}

async function withdrawTron(dto: withdrawDto) {
  console.log('****** withdraw tron *******')
  console.dir(dto, { depth: 10 })

  const tronWeb = new TronWeb({
    fullHost: dto.rpcUrl,
    privateKey: dto.privateKey,
  })

  dto.recipientAddress = tronWeb.address.toHex(dto.recipientAddress)
  dto.cloneAddress = tronWeb.address.toHex(dto.cloneAddress)
  dto.token.address = tronWeb.address.toHex(dto.token.address)

  const triggerContractBody = {
    contract_address: dto.cloneAddress,
    owner_address: tronWeb.address.toHex(tronWeb.address.fromPrivateKey(dto.privateKey) as string),
    function_selector: '', // set down in code
    parameter: '', // set down in code
    call_value: 0,
    fee_limit: 306000000,
  }
  if (dto.token.native) {
    const parameterTronNative = encodeTronParams(
      [
        { type: `uint256`, value: dto.amount },
        { type: `address`, value: tronWeb.address.toHex(dto.recipientAddress) },
      ],
      tronWeb,
    )
    triggerContractBody.parameter = parameterTronNative
    triggerContractBody.function_selector = 'withdraw(uint256,address)'
  } else {
    const parameterTronERC20 = encodeTronParams(
      [
        { type: `address`, value: tronWeb.address.toHex(dto.token.address) },
        { type: `uint256`, value: dto.amount },
        { type: `address`, value: tronWeb.address.toHex(dto.recipientAddress) },
      ],
      tronWeb,
    )
    triggerContractBody.parameter = parameterTronERC20
    triggerContractBody.function_selector = 'withdrawERC20(address,uint256,address)'
  }
  console.dir({ triggerContractBody }, { depth: 10 })

  const triggerResult = await axios.post(`${dto.rpcUrl}/wallet/triggersmartcontract`, triggerContractBody)

  console.dir({ triggerResult: triggerResult.data }, { depth: 10 })

  const transaction = triggerResult.data.transaction

  const signedtxn = await tronWeb.trx.sign(transaction, dto.privateKey)
  console.dir({ signedtxn }, { depth: 10 })

  const result = {
    transaction,
    receipt: await tronWeb.trx.sendRawTransaction(transaction),
  }
  console.log(result)

  const broadcastResponse = (await axios.post(`${dto.rpcUrl}/wallet/broadcasttransaction`, signedtxn)).data

  console.log('Transaction broadcasted successfully:', broadcastResponse)
}

async function main() {
  // бч сеть токен клон сумма
  const [_blockchain, _network, _token, cloneAddress, amount, recipientAddress] = process.argv.slice(2)
  const blockchain = _blockchain.toLocaleUpperCase() as Blockchain
  const network = _network.toLocaleUpperCase() as Network
  const token = _token.toLocaleUpperCase() as string

  // check valid input
  if (!tokensConfig[blockchain]?.[network]?.tokens[token] || !cloneAddress || !recipientAddress || !amount) {
    throw new Error('bad input')
  }

  if ([Blockchain.ETH, Blockchain.BSC].includes(blockchain)) {
    const tokenConfig = tokensConfig[blockchain]![network]!
    await withdrawEvm({
      rpcUrl: tokenConfig.rpcUrl,
      privateKey: tokenConfig.privateKey,
      cloneAddress,
      token: tokenConfig.tokens[token],
      amount,
      recipientAddress,
    })
  } else if ([Blockchain.TRX].includes(blockchain)) {
    const tokenConfig = tokensConfig[blockchain]![network]!
    await withdrawTron({
      rpcUrl: tokenConfig.rpcUrl,
      privateKey: tokenConfig.privateKey,
      cloneAddress,
      token: tokenConfig.tokens[token],
      amount,
      recipientAddress,
    })
  } else {
    throw new Error('unknown blockchain')
  }
}

main()
