/* eslint-disable import/prefer-default-export */
import fs from 'fs'
import hre from 'hardhat'
import { resolve } from 'path'
import { TronWeb } from 'tronweb'

import { getMockAddresses_tron, MockContractsAddress } from '../../../tasks/addresses'

const tronboxPath = '../../../tronbox/build'

const wtrxPath = `${tronboxPath}/MockWETH.json`
const tokenPath = `${tronboxPath}/MockToken.json`
const routerPath = `${tronboxPath}/MockUniswapV2Router.json`

export async function deployHelperTron(tronWebs: TronWeb[]) {
  const owner = tronWebs[0].defaultAddress.base58 as string
  const mockContracts = getMockAddresses_tron(owner)
  const deployedContracts = await deployContracts(tronWebs, mockContracts)

  return {
    owner,
    mockContracts,
    deployedContracts,
  }
}

const deployContracts = async (tronWebs: TronWeb[], mockContracts: MockContractsAddress) => {
  const { run } = hre
  const tronWebOwner = tronWebs[0]

  const wtrxAbi = JSON.parse(fs.readFileSync(resolve(__dirname, wtrxPath)).toString()).abi
  // const tokenAbi = JSON.parse(fs.readFileSync(resolve(__dirname, tokenPath)).toString()).abi
  // const sunSwapAbi = JSON.parse(fs.readFileSync(resolve(__dirname, routerPath)).toString()).abi

  console.log('Owner', tronWebOwner.defaultAddress.base58 as string)

  const _tronWTRX = tronWebOwner.contract(wtrxAbi, mockContracts.tokens.weth)
  console.log('TronWTRX get from', tronWebOwner.address.fromHex(_tronWTRX.address as string))

  // const _tronUSDC = tronWeb.contract(tokenAbi, mockContracts.tokens.usdc)
  // console.log("TronUCDC get from", tronWeb.address.fromHex(_tronUSDC.address as string))

  // const _tronUSDT = tronWeb.contract(tokenAbi, mockContracts.tokens.usdt)
  // console.log("TronUCDT get from", tronWeb.address.fromHex(_tronUSDT.address as string))

  // const _tronSunSwap = tronWeb.contract(sunSwapAbi, mockContracts.defies[0].addresses[0])
  // console.log("TronSunSwap get from", tronWeb.address.fromHex(_tronSunSwap.address as string))

  const { contractWithdrawal: _tronUniversalWithdrawal, contractFactory: _universalFactory } = await run('deploy:tron_universal_factory')

  const { testToken: _testToken } = await run('deploy:tron_test_token')

  const { testTokenNoBool: _testTokenNoBool } = await run('deploy:tron_test_token_no_bool')

  return {
    _tronWTRX,
    // _tronUSDC,
    // _tronUSDT,
    // _tronSunSwap,
    _tronUniversalWithdrawal,
    _universalFactory,
    _testToken,
    _testTokenNoBool,
  }
}
