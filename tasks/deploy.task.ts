import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { BaseContract } from 'ethers'
import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment, RunTaskFunction } from 'hardhat/types'

import { localNetworks } from './utils'

// npx hardhat deploy:universal_withdrawal --network bscTestnet
// npx hardhat deploy:universal_withdrawal --network localhost_bsc
// npx hardhat deploy:universal_withdrawal --network localhost_eth
task('deploy:universal_withdrawal', 'Deploys the UniversalWithdrawal contract').setAction(async ({ _ }, hre: HardhatRuntimeEnvironment) => {
  const { ethers, run } = hre
  const [signer] = await ethers.getSigners()

  const Withdrawal = await ethers.getContractFactory('UniversalWithdrawal')
  const withdrawal = await Withdrawal.deploy()
  await withdrawal.waitForDeployment()

  const withdrawalAddress = await withdrawal.getAddress()
  console.log('UniversalWithdrawal deployed to:', withdrawalAddress)
  await verify(run, signer, withdrawalAddress, [])

  return { withdrawal, withdrawalAddress }
})

// withdrawal - the address of the UniversalWithdrawal contract, necessary for initializing the UniversalFactory and admin panel and storage
// npx hardhat deploy:universal_factory --network bscTestnet --withdrawal
// npx hardhat deploy:universal_factory --network localhost_bsc --withdrawal
// npx hardhat deploy:universal_factory --network localhost_eth --withdrawal
task('deploy:universal_factory', 'Deploys the UniversalFactory contract')
  .addOptionalParam('withdrawal')
  .setAction(async ({ withdrawal }: { withdrawal: BaseContract }, hre: HardhatRuntimeEnvironment) => {
    const { ethers, run } = hre
    const [signer] = await ethers.getSigners()

    let withdrawalAddress: string

    if (!withdrawal) {
      const withdraw = await run('deploy:universal_withdrawal')

      withdrawal = withdraw.withdrawal
      withdrawalAddress = withdraw.withdrawalAddress
    } else {
      withdrawal = await ethers.getContractAt('UniversalWithdrawal', withdrawal)
      withdrawalAddress = await withdrawal.getAddress()
    }

    const Factory = await ethers.getContractFactory('UniversalFactory')
    const factory = await Factory.deploy(withdrawalAddress)
    await factory.waitForDeployment()

    const factoryAddress = await factory.getAddress()
    console.log(`UniversalFactory deployed to: ${factoryAddress}`)
    await verify(run, signer, factoryAddress, [withdrawalAddress])
    return { withdrawal, factory, withdrawalAddress, factoryAddress }
  })

// npx hardhat deploy:test_token --network bscTestnet
// npx hardhat deploy:test_token --network localhost_bsc
// npx hardhat deploy:test_token --network localhost_eth
task('deploy:test_token', 'Deploys the TestToken').setAction(async ({ _ }, hre: HardhatRuntimeEnvironment) => {
  const { ethers, run } = hre
  const [signer] = await ethers.getSigners()

  const TestToken = await ethers.getContractFactory('TestToken')
  const testToken = await TestToken.deploy()
  await testToken.waitForDeployment()

  const testTokenAddress = await testToken.getAddress()
  console.log('TestToken deployed to:', testTokenAddress)
  await verify(run, signer, testTokenAddress, [])
  return testToken
})

// npx hardhat deploy:test_token_no_bool --network bscTestnet
// npx hardhat deploy:test_token_no_bool --network localhost_bsc
// npx hardhat deploy:test_token_no_bool --network localhost_eth
task('deploy:test_token_no_bool', 'Deploys the TestTokenNoBool').setAction(async ({ _ }, hre: HardhatRuntimeEnvironment) => {
  const { ethers, run } = hre
  const [signer] = await ethers.getSigners()

  const TestTokenNoBool = await ethers.getContractFactory('TestTokenNoBool')
  const testTokenNoBool = await TestTokenNoBool.deploy()
  await testTokenNoBool.waitForDeployment()

  const testTokenNoBoolAddress = await testTokenNoBool.getAddress()
  console.log('TestTokenNoBool deployed to:', testTokenNoBoolAddress)
  await verify(run, signer, testTokenNoBoolAddress, [])
  return testTokenNoBool
})

const verify = async (run: RunTaskFunction, signer: SignerWithAddress, address: string, constructorArguments: any[] = []) => {
  await new Promise(r => setTimeout(r, 5000))

  const network: string = (await signer.provider.getNetwork()).name

  if (!localNetworks.includes(network)) {
    await new Promise(r => setTimeout(r, 5000))

    await run('verify:verify', {
      address,
      constructorArguments,
    })
  }
}
