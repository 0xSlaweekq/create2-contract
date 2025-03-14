import { randomUUID } from 'node:crypto'

import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { expect } from 'chai'
import { BaseContract, ContractFactory } from 'ethers'
import hre from 'hardhat'

import {
  TestToken,
  TestTokenNoBool,
  UniversalFactory,
  UniversalWithdrawal,
  UniversalWithdrawal__factory,
  UpgradeableProxy,
  UpgradeableProxy__factory,
} from '../build/typechain'
import { callProxy, getError } from '../utils/utils'
import { prepareContractsTest, prepareSigners } from './helpers'

describe('BSC test', function () {
  const { ethers } = hre
  const { ZeroAddress } = ethers

  const depositAmount = ethers.parseEther('0.0001')
  const mintAmount = ethers.parseEther('1000')
  const transferAmount = ethers.parseEther('10')
  const salt = ethers.id(randomUUID())
  const salt2 = ethers.id(randomUUID())

  let owner: SignerWithAddress
  let alice: SignerWithAddress
  let aliceAddress: string
  let bob: SignerWithAddress
  let bobAddress: string
  let jane: SignerWithAddress
  let janeAddress: string

  let universalFactory: UniversalFactory
  let universalWithdrawal: UniversalWithdrawal
  let testToken: TestToken
  let testTokenNoBool: TestTokenNoBool

  let upgradeableProxy: UpgradeableProxy
  let upgradeableProxy2: UpgradeableProxy

  let factoryAddress: string
  let universalWithdrawalAddress: string
  let upgradeableProxyAddress: string
  let upgradeableProxyAddress2: string
  let tokenAddress: string
  let tokenNoBoolAddress: string

  let upgradeableProxyFactory: UpgradeableProxy__factory
  let universalWithdrawalFactory: UniversalWithdrawal__factory

  before(async function () {
    await prepareSigners(this)
    ;[owner, alice, bob, , jane] = this.signers
    aliceAddress = await alice.getAddress()
    bobAddress = await bob.getAddress()
    janeAddress = await jane.getAddress()

    await prepareContractsTest({ thisObject: this })

    universalFactory = this.universalFactory
    universalWithdrawal = this.universalWithdrawal
    testToken = this.testToken
    testTokenNoBool = this.testTokenNoBool

    // universalFactory = (await ethers.getContractAt(
    //     "UniversalFactory",
    //     "0xA42e70F6BdD98bC6D03Ae2f1200A70d21cF6Ed1f",
    //     owner,
    // )) as BaseContract as UniversalFactory
    // universalWithdrawal = (await ethers.getContractAt(
    //     "UniversalWithdrawal",
    //     "0x523266D9de3dB28591632E630a7038aEb8703756",
    //     owner,
    // )) as BaseContract as UniversalWithdrawal
    // testToken = (await ethers.getContractAt("TestToken", "0xE923718a45E4EA87AB6c51F7944F9E7B39a3a52a", owner)) as BaseContract as TestToken
    // testTokenNoBool = (await ethers.getContractAt(
    //     "TestTokenNoBool",
    //     "0x55B27b79322494a4eb74416AB6F1c3Ae8145324D",
    //     owner,
    // )) as BaseContract as TestTokenNoBool

    await testToken.mint(aliceAddress, mintAmount)
    await testTokenNoBool.mint(aliceAddress, mintAmount)

    const predictedAddress = await universalFactory.predictAddress(salt)
    const clone = await universalFactory.connect(owner).createClone(salt)
    const txn = await clone.wait(2)
    expect(txn?.status).to.be.equal(1)

    const predictedAddress2 = await universalFactory.predictAddress(salt2)
    const clone2 = await universalFactory.connect(owner).createClone(salt2)
    const txn2 = await clone2.wait(2)
    expect(txn2?.status).to.be.equal(1)

    upgradeableProxyFactory = (await ethers.getContractFactory('UpgradeableProxy')) as ContractFactory as UpgradeableProxy__factory

    universalWithdrawalFactory = (await ethers.getContractFactory('UniversalWithdrawal')) as ContractFactory as UniversalWithdrawal__factory

    upgradeableProxy = upgradeableProxyFactory.attach(predictedAddress) as BaseContract as UpgradeableProxy
    upgradeableProxy2 = upgradeableProxyFactory.attach(predictedAddress2) as BaseContract as UpgradeableProxy

    factoryAddress = await universalFactory.getAddress()
    upgradeableProxyAddress = await upgradeableProxy.getAddress()
    upgradeableProxyAddress2 = await upgradeableProxy2.getAddress()
    universalWithdrawalAddress = await universalWithdrawal.getAddress()

    tokenAddress = await testToken.getAddress()
    tokenNoBoolAddress = await testTokenNoBool.getAddress()
  })

  after(function () {
    process.exit(0)
  })

  describe('Test #0 - Contract Deployment and Functionality', function () {
    it('Test #0.1 - should log the predicted address and verify ownership', async function () {
      // Verifying the ownership of the universalFactory
      expect(await universalFactory.owner()).to.be.equal(owner.address)

      // Ensuring that initialization cannot be done twice
      await expect(upgradeableProxy.initProxy(owner.address, factoryAddress, universalWithdrawalAddress)).to.be.revertedWith(
        'Initializable: contract is already initialized',
      )
    })

    it('Test #0.2 - should deposit ETH and verify withdrawal to bob', async function () {
      try {
        // owner sends ETH to the clone wallet
        const tx = await owner.sendTransaction({
          to: upgradeableProxyAddress,
          value: depositAmount,
        })
        const txn = await tx.wait(2)
        expect(txn?.status).to.be.equal(1)

        expect(await ethers.provider.getBalance(upgradeableProxyAddress)).to.be.equal(depositAmount)

        // Bob's balance before the withdrawal
        const bobBalanceBefore = await ethers.provider.getBalance(bobAddress)

        // Withdraw ETH to Bob via proxy
        const data = universalWithdrawalFactory.interface.encodeFunctionData('withdraw', [[bobAddress], [depositAmount]])

        // Use sendTransaction to proxy
        const tx2 = await callProxy({
          owner,
          proxyAddress: upgradeableProxyAddress,
          data,
        })
        const txn2 = await tx2.wait(2)
        expect(txn2?.status).to.be.equal(1)

        const bobBalanceAfter = await ethers.provider.getBalance(bobAddress)
        expect(bobBalanceAfter - bobBalanceBefore).to.be.equal(depositAmount)
      } catch (e) {
        await getError({ e })
      }
    })

    it('Test #0.3 - should deposit and withdraw ERC20 tokens', async function () {
      // Transfer ERC20 tokens to the clone wallet
      expect(await testToken.balanceOf(upgradeableProxyAddress)).to.be.equal(0)

      // Alice sends ERC20 tokens to the UniversalWithdrawal contract
      const tx = await testToken.connect(alice).transfer(upgradeableProxyAddress, transferAmount)
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)

      const b = await testToken.balanceOf(upgradeableProxyAddress)
      const c = await testToken.balanceOf(bobAddress)
      expect(b).to.be.equal(transferAmount)

      // Withdraw ERC20 tokens to Bob
      const data = universalWithdrawalFactory.interface.encodeFunctionData('withdrawERC20', [tokenAddress, bobAddress, transferAmount])

      // Use sendTransaction to proxy
      await expect(
        callProxy({
          owner: alice,
          proxyAddress: upgradeableProxyAddress,
          data,
          allowThrow: false,
        }),
      ).to.be.revertedWithCustomError(upgradeableProxy, 'OnlyAdmin')

      const tx2 = await callProxy({
        owner,
        proxyAddress: upgradeableProxyAddress,
        data,
      })
      const txn2 = await tx2.wait(2)
      expect(txn2?.status).to.be.equal(1)
      const b2 = await testToken.balanceOf(upgradeableProxyAddress)
      const c2 = await testToken.balanceOf(bobAddress)
      expect(b - b2).to.be.equal(transferAmount)
      expect(c2 - c).to.be.equal(transferAmount)
      expect(b2).to.be.equal(0)
    })

    it('Test #0.4 - should deposit and withdraw ERC20 tokens (alternative token)', async function () {
      try {
        // Transfer ERC20 tokens to the clone wallet
        expect(await testTokenNoBool.balanceOf(upgradeableProxyAddress)).to.be.equal(0)
        // Alice sends ERC20 tokens to the upgradeableProxy contract
        const tx = await testTokenNoBool.connect(alice).transfer(upgradeableProxyAddress, transferAmount)
        const txn = await tx.wait(2)
        expect(txn?.status).to.be.equal(1)

        const b = await testTokenNoBool.balanceOf(upgradeableProxyAddress)
        const c = await testTokenNoBool.balanceOf(bobAddress)
        expect(b).to.be.equal(transferAmount)

        // Withdraw ERC20 tokens to Bob
        const data = universalWithdrawalFactory.interface.encodeFunctionData('withdrawERC20', [tokenNoBoolAddress, bobAddress, transferAmount])

        // Use sendTransaction to proxy
        const tx2 = await callProxy({
          owner,
          proxyAddress: upgradeableProxyAddress,
          data,
        })
        const txn2 = await tx2.wait(2)
        expect(txn2?.status).to.be.equal(1)

        const b2 = await testTokenNoBool.balanceOf(upgradeableProxyAddress)
        const c2 = await testTokenNoBool.balanceOf(bobAddress)
        expect(b - b2).to.be.equal(transferAmount)
        expect(c2 - c).to.be.equal(transferAmount)
        expect(b2).to.be.equal(0)
      } catch (e) {
        await getError({ e })
      }
    })

    it('Test #0.5 - should test the upgradable UniversalWithdrawal proxy contract', async function () {
      // Deploy the UniversalWithdrawal contract
      const Withdrawal = await ethers.getContractFactory('UniversalWithdrawal')
      const withdrawal = await Withdrawal.deploy()
      await withdrawal.waitForDeployment()
      const withdrawalAddress = await withdrawal.getAddress()

      // Verify initial `withdrawal` value in proxy
      expect(await upgradeableProxy.withdrawal()).to.be.equal(universalWithdrawalAddress)

      // Update `withdrawal` in proxy and verify the change
      const tx = await upgradeableProxy.updateWithdrawal(withdrawalAddress)
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)

      // Ensure the proxy's initial withdrawal implementation is correctly set
      expect(await upgradeableProxy.withdrawal()).to.be.equal(withdrawalAddress)

      // Deploy UniversalFactory contract
      const Factory = await ethers.getContractFactory('UniversalFactory')
      const factory = await Factory.deploy(withdrawalAddress)
      await factory.waitForDeployment()
      const factoryAddress2 = await factory.getAddress()

      // Verify initial `factory` value in proxy
      expect(await upgradeableProxy.factory()).to.be.equal(factoryAddress)

      // Update `factory` in proxy and verify the change
      const tx2 = await upgradeableProxy.updateFactory(factoryAddress2)
      const txn2 = await tx2.wait(2)
      expect(txn2?.status).to.be.equal(1)

      // Ensure the proxy's initial factory value is correctly set
      expect(await upgradeableProxy.factory()).to.be.equal(factoryAddress2)
    })
  })

  describe('Test #1 - Asset Withdrawal from Multiple Cloned Addresses', function () {
    let bobBalanceBefore1: bigint
    let bobBalanceBefore2: bigint

    beforeEach(async function () {
      // Transfer test ERC20 tokens to the clone contract
      const tx = await testToken.connect(alice).transfer(upgradeableProxyAddress, transferAmount)
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)

      // Transfer another ERC20 token (testTokenNoBool) to the clone contract
      const tx2 = await testTokenNoBool.connect(alice).transfer(upgradeableProxyAddress, transferAmount)
      const txn2 = await tx2.wait(2)
      expect(txn2?.status).to.be.equal(1)

      // Store Bob's balance before the transfers
      bobBalanceBefore1 = await testToken.balanceOf(bobAddress)
      bobBalanceBefore2 = await testTokenNoBool.balanceOf(bobAddress)
    })

    it('Test #1.1 - Universal Transfer Success and Failure for Different Tokens', async function () {
      // Test that the universal transfer works for the first token (testToken)
      const data = universalWithdrawalFactory.interface.encodeFunctionData('universalTransfer', [tokenAddress, bobAddress, transferAmount, '0'])

      const tx = await callProxy({
        owner,
        proxyAddress: upgradeableProxyAddress,
        data,
      })
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)

      // Test that the universal transfer fails for the second token (testTokenNoBool)
      // TODO testing in the testnet is not working yet, in the local node everything is ok
      // const data2 = universalWithdrawalFactory.interface.encodeFunctionData("universalTransfer", [
      //     tokenNoBoolAddress,
      //     bobAddress,
      //     transferAmount,
      //     "0",
      // ])

      // console.log(1)
      // await expect(
      //     callProxy({
      //         owner,
      //         proxyAddress: upgradeableProxyAddress,
      //         data: data2,
      //         allowThrow: false,
      //     }),
      // ).to.be.revertedWithoutReason()
      // console.log(3)
    })

    it("Test #1.2 - Universal Transfer for Different Tokens with Mode '1'", async function () {
      // Perform a universal transfer for the first token (testToken) and verify balance change
      const data = universalWithdrawalFactory.interface.encodeFunctionData('universalTransfer', [tokenAddress, bobAddress, transferAmount, '1'])

      // Use sendTransaction to proxy
      const tx = await callProxy({
        owner,
        proxyAddress: upgradeableProxyAddress,
        data,
      })
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)

      // Perform a universal transfer for the second token (testTokenNoBool) and verify balance change

      const data2 = universalWithdrawalFactory.interface.encodeFunctionData('universalTransfer', [
        tokenNoBoolAddress,
        bobAddress,
        transferAmount * 2n,
        '1',
      ])

      // Use sendTransaction to proxy
      const tx2 = await callProxy({
        owner,
        proxyAddress: upgradeableProxyAddress,
        data: data2,
      })
      const txn2 = await tx2.wait(2)
      expect(txn2?.status).to.be.equal(1)

      // Get Bob's balance after the transfers
      const bobBalanceAfter1 = await testToken.balanceOf(bobAddress)
      const bobBalanceAfter2 = await testTokenNoBool.balanceOf(bobAddress)

      // Verify the balance increase for both tokens
      expect(bobBalanceAfter1 - bobBalanceBefore1).to.be.equal(transferAmount)
      expect(bobBalanceAfter2 - bobBalanceBefore2).to.be.equal(transferAmount * 2n)
    })

    it("Test #1.3 - Universal Transfer for Different Tokens with Mode '2'", async function () {
      // Perform a universal transfer for the first token (testToken) with a different transfer mode ("2")
      const data = universalWithdrawalFactory.interface.encodeFunctionData('universalTransfer', [tokenAddress, bobAddress, transferAmount, '2'])

      // Use sendTransaction to proxy
      const tx = await callProxy({
        owner,
        proxyAddress: upgradeableProxyAddress,
        data,
      })
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)

      // Perform a universal transfer for the second token (testTokenNoBool) with the same mode ("2")
      const data2 = universalWithdrawalFactory.interface.encodeFunctionData('universalTransfer', [
        tokenNoBoolAddress,
        bobAddress,
        transferAmount,
        '2',
      ])

      // Use sendTransaction to proxy
      const tx2 = await callProxy({
        owner,
        proxyAddress: upgradeableProxyAddress,
        data: data2,
      })
      const txn2 = await tx2.wait(2)
      expect(txn2?.status).to.be.equal(1)

      // Get Bob's balance after the transfers
      const bobBalanceAfter1 = await testToken.balanceOf(bobAddress)
      const bobBalanceAfter2 = await testTokenNoBool.balanceOf(bobAddress)

      // Verify the balance increase for both tokens
      expect(bobBalanceAfter1 - bobBalanceBefore1).to.be.equal(transferAmount)
      expect(bobBalanceAfter2 - bobBalanceBefore2).to.be.equal(transferAmount)
    })
  })

  describe('Test #2 - Asset Withdrawal for Multiple Users from Different Tokens', function () {
    let janeBalanceBefore1: bigint
    let janeBalanceBefore2: bigint

    before(async function () {
      // Transfer ERC20 tokens to the clone contract
      const tx = await testToken.connect(alice).transfer(upgradeableProxyAddress, transferAmount)
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)

      // Transfer another ERC20 token (testTokenNoBool) to the clone contract
      const tx2 = await testTokenNoBool.connect(alice).transfer(upgradeableProxyAddress, transferAmount)
      const txn2 = await tx2.wait(2)
      expect(txn2?.status).to.be.equal(1)

      // Store Jane's balance before the withdrawals
      janeBalanceBefore1 = await testToken.balanceOf(janeAddress)
      janeBalanceBefore2 = await testTokenNoBool.balanceOf(janeAddress)
    })

    it('Test #2.1 - Withdraw Many ERC20 Tokens to Jane and Verify Balances', async function () {
      // Check the initial balance of the clone contract
      const b = await testToken.balanceOf(upgradeableProxyAddress)
      expect(b).to.be.equal(transferAmount)

      const c = await testTokenNoBool.balanceOf(upgradeableProxyAddress)
      expect(c).to.be.equal(transferAmount)

      // Perform a withdrawal of both ERC20 tokens to Jane
      const data = universalWithdrawalFactory.interface.encodeFunctionData('withdrawManyERC20', [
        [tokenAddress, tokenNoBoolAddress],
        [janeAddress, janeAddress],
        [transferAmount, transferAmount],
      ])

      // Use sendTransaction to proxy
      const tx = await callProxy({
        owner,
        proxyAddress: upgradeableProxyAddress,
        data,
      })
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)

      // Get Jane's balance after the withdrawal
      const janeBalanceAfter1 = await testToken.balanceOf(janeAddress)
      const janeBalanceAfter2 = await testTokenNoBool.balanceOf(janeAddress)

      // Verify Jane's balance has increased by the withdrawn amount
      expect(janeBalanceAfter1 - janeBalanceBefore1).to.be.equal(transferAmount)
      expect(janeBalanceAfter2 - janeBalanceBefore2).to.be.equal(transferAmount)

      // Check the balance of the clone contract after the withdrawal
      const b1 = await testToken.balanceOf(upgradeableProxyAddress)
      const c1 = await testTokenNoBool.balanceOf(upgradeableProxyAddress)

      // Verify that the balances of the clone contract have decreased by the withdrawn amount
      expect(b - b1).to.be.equal(transferAmount)
      expect(c - c1).to.be.equal(transferAmount)

      // Verify the clone contract's balances are now 0
      expect(b1).to.be.equal(0)
      expect(c1).to.be.equal(0)
    })
  })

  describe('Test #3 - Error Handling for Asset Withdrawal from Multiple Cloned Addresses', function () {
    let janeBalanceBefore1: bigint
    let janeBalanceBefore2: bigint

    before(async function () {
      // Transfer ERC20 tokens to the clone contract at upgradeableProxyAddress
      const tx = await testToken.connect(alice).transfer(upgradeableProxyAddress, transferAmount)
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)

      // Transfer ERC20 tokens to the clone contract at upgradeableProxyAddress2
      const tx2 = await testToken.connect(alice).transfer(upgradeableProxyAddress2, transferAmount)
      const txn2 = await tx2.wait(2)
      expect(txn2?.status).to.be.equal(1)

      // Transfer ERC20 tokens (testTokenNoBool) to upgradeableProxyAddress2
      const tx3 = await testTokenNoBool.connect(alice).transfer(upgradeableProxyAddress2, transferAmount)
      const txn3 = await tx3.wait(2)
      expect(txn3?.status).to.be.equal(1)

      // Store Jane's balance before the withdrawals
      janeBalanceBefore1 = await testToken.balanceOf(janeAddress)
      janeBalanceBefore2 = await testTokenNoBool.balanceOf(janeAddress)

      // Send ETH to the clone contract at upgradeableProxyAddress
      const tx4 = await owner.sendTransaction({
        to: upgradeableProxyAddress,
        value: depositAmount,
      })
      const txn4 = await tx4.wait(2)
      expect(txn4?.status).to.be.equal(1)

      // Send ETH to the clone contract at upgradeableProxyAddress2
      const tx5 = await owner.sendTransaction({
        to: upgradeableProxyAddress2,
        value: depositAmount * 2n,
      })
      const txn5 = await tx5.wait(2)
      expect(txn5?.status).to.be.equal(1)
    })

    it('Test #3.1 - Withdraw Assets from Multiple Clones and Validate Balances', async function () {
      expect(factoryAddress).to.be.equal(await universalFactory.factory())
      // Verify token balances in the clone contracts
      expect(await testToken.balanceOf(upgradeableProxyAddress)).to.be.equal(transferAmount)
      expect(await testToken.balanceOf(upgradeableProxyAddress2)).to.be.equal(transferAmount)
      expect(await testTokenNoBool.balanceOf(upgradeableProxyAddress2)).to.be.equal(transferAmount)

      // Verify ETH balances in the clone contracts
      const b1 = await ethers.provider.getBalance(upgradeableProxyAddress)
      const b2 = await ethers.provider.getBalance(upgradeableProxyAddress2)
      expect(b1).to.be.equal(depositAmount)
      expect(b2).to.be.equal(depositAmount * 2n)

      // Test invalid withdraw requests
      await expect(
        universalFactory
          .connect(owner)
          .withdrawAssetsFromClones([upgradeableProxyAddress, upgradeableProxyAddress2], [0], janeAddress, ZeroAddress),
      ).to.be.revertedWithCustomError(universalFactory, 'ArrayLengthMismatch')

      await expect(
        universalFactory.connect(owner).withdrawAssetsFromClones([upgradeableProxyAddress, ZeroAddress], [0, 0], janeAddress, ZeroAddress),
      ).to.be.revertedWithCustomError(universalFactory, 'InvalidAddressClone')

      await expect(
        universalFactory
          .connect(owner)
          .withdrawAssetsFromClones([upgradeableProxyAddress, upgradeableProxyAddress2], [0, 0], ZeroAddress, ZeroAddress),
      ).to.be.revertedWithCustomError(universalFactory, 'InvalidAddressRecipient')

      // Perform the withdrawal of assets from the clones to Jane's address
      const tx = await universalFactory
        .connect(owner)
        .withdrawAssetsFromClones([upgradeableProxyAddress], [transferAmount], janeAddress, tokenAddress)
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)

      // Withdraw assets from the second clone (upgradeableProxyAddress2) for both tokens
      for (const t of [tokenAddress, tokenNoBoolAddress]) {
        const tx2 = await universalFactory.connect(owner).withdrawAssetsFromClones([upgradeableProxyAddress2], [transferAmount], janeAddress, t)
        const txn2 = await tx2.wait(2)
        expect(txn2?.status).to.be.equal(1)
      }

      // Withdraw ETH from both clones (upgradeableProxyAddress and upgradeableProxyAddress2)
      await expect(
        universalFactory
          .connect(owner)
          .withdrawAssetsFromClones([upgradeableProxyAddress, upgradeableProxyAddress2], [depositAmount * 2n, 0], janeAddress, ZeroAddress),
      ).to.be.revertedWithCustomError(universalFactory, 'WithdrawFailed')

      const tx2 = await universalFactory
        .connect(owner)
        .withdrawAssetsFromClones(
          [upgradeableProxyAddress, upgradeableProxyAddress2],
          [depositAmount, depositAmount * 2n],
          janeAddress,
          ZeroAddress,
        )
      const txn2 = await tx2.wait(2)
      expect(txn2?.status).to.be.equal(1)

      // Get Jane's balance after the withdrawals
      const janeBalanceAfter1 = await testToken.balanceOf(janeAddress)
      const janeBalanceAfter2 = await testTokenNoBool.balanceOf(janeAddress)

      // Verify that Jane's balance has increased by the total withdrawn amounts
      expect(janeBalanceAfter1 - janeBalanceBefore1).to.be.equal(transferAmount * 2n)
      expect(janeBalanceAfter2 - janeBalanceBefore2).to.be.equal(transferAmount)

      // Verify that the clone contracts' balances are now zero
      expect(await testToken.balanceOf(upgradeableProxyAddress)).to.be.equal(0)
      expect(await testToken.balanceOf(upgradeableProxyAddress2)).to.be.equal(0)
      expect(await testTokenNoBool.balanceOf(upgradeableProxyAddress2)).to.be.equal(0)

      // Verify that the ETH balances of the clone contracts are now zero
      expect(await ethers.provider.getBalance(upgradeableProxyAddress)).to.be.equal(0)
      expect(await ethers.provider.getBalance(upgradeableProxyAddress2)).to.be.equal(0)
    })
  })

  describe('Test #5 - ERC20 Token Transfer and Withdrawal via Proxy', function () {
    before(async function () {
      // Ensure the initial balance of the proxy is zero
      expect(await testToken.balanceOf(upgradeableProxyAddress)).to.be.equal(0)

      // Alice transfers ERC20 tokens to the proxy address
      const tx = await testToken.connect(alice).transfer(upgradeableProxyAddress, transferAmount)
      const txn = await tx.wait(2)
      expect(txn?.status).to.be.equal(1)
    })

    it('Test #5.1 - Withdraw ERC20 Tokens from admin Jane to Bob', async function () {
      try {
        // Check initial balances
        const b = await testToken.balanceOf(upgradeableProxyAddress)
        const c = await testToken.balanceOf(bobAddress)
        expect(b).to.be.equal(transferAmount)

        // Prepare data for withdrawal
        const data = universalWithdrawalFactory.interface.encodeFunctionData('withdrawERC20', [tokenAddress, bobAddress, transferAmount])

        // Verify Jane is not an admin initially
        expect(await upgradeableProxy.isAdmined(janeAddress)).to.be.equal(false)

        // Attempt to withdraw without admin rights, expect failure
        await expect(
          callProxy({
            owner: jane,
            proxyAddress: upgradeableProxyAddress,
            data,
            allowThrow: false,
          }),
        ).to.be.revertedWithCustomError(upgradeableProxy, 'OnlyAdmin')

        // Grant admin rights to Jane
        const tx = await upgradeableProxy.setAdmin([janeAddress], true)
        const txn = await tx.wait(2)
        expect(txn?.status).to.be.equal(1)
        expect(await upgradeableProxy.isAdmined(janeAddress)).to.be.equal(true)

        // Successfully withdraw tokens as admin
        const tx2 = await callProxy({
          owner: jane,
          proxyAddress: upgradeableProxyAddress,
          data,
        })
        const txn2 = await tx2.wait(2)
        expect(txn2?.status).to.be.equal(1)

        // Verify balances after withdrawal
        const b2 = await testToken.balanceOf(upgradeableProxyAddress)
        const c2 = await testToken.balanceOf(bobAddress)
        expect(b - b2).to.be.equal(transferAmount)
        expect(c2 - c).to.be.equal(transferAmount)
        expect(b2).to.be.equal(0)
      } catch (e) {
        await getError({ e })
      }
    })
  })
})
