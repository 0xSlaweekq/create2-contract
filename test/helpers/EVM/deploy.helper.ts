/* eslint-disable import/prefer-default-export */
import hre from 'hardhat'

import { getMockAddresses_bsc, getMockAddresses_eth, MockContractsAddress } from '../../../tasks/addresses'

export async function deployHelper(chain?: number) {
  let mockAddresses: MockContractsAddress = {
    owner: '',
    defies: [
      {
        addresses: [],
      },
    ],
    tokens: {
      weth: '',
      usdt: '',
      usdc: '',
    },
  }

  const [signer] = await hre.ethers.getSigners()
  const owner: string = await signer.getAddress()
  const deployedContracts = await deployContracts()

  if (chain === 1) {
    mockAddresses = getMockAddresses_eth(owner)
  } else if (chain === 56) {
    mockAddresses = getMockAddresses_bsc(owner)
  }

  return {
    owner,
    mockContracts: mockAddresses,
    deployedContracts,
  }
}

const deployContracts = async () => {
  const { run } = hre

  const { withdrawal: universalWithdrawal, factory: universalFactory } = await run('deploy:universal_factory')
  // const universalWithdrawal = await run("deploy:universal_withdrawal")
  // const universalFactory = await run("deploy:universal_factory", { logic: await universalWithdrawal.getAddress() })
  const testToken = await run('deploy:test_token')
  const testTokenNoBool = await run('deploy:test_token_no_bool')

  return {
    universalFactory,
    universalWithdrawal,
    testToken,
    testTokenNoBool,
  }
}
