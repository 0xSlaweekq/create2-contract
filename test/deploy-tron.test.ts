import { randomUUID } from 'node:crypto'

import { expect } from 'chai'
import dotenv from 'dotenv'
import fs from 'fs'
import hre from 'hardhat'
import { resolve } from 'path'
import { Contract, TronWeb } from 'tronweb'

import { WithdrawalMethods } from '../utils/interfaces'
import { callProxyTron, sleep } from '../utils/utils'
import { prepareContractsTron, prepareSignersTron } from './helpers'

const envConfig = dotenv.config({ path: resolve('./', '.env') })
const { PORT_TRON } = envConfig.parsed || {}

const tronUrl = `http://0.0.0.0:${PORT_TRON}`

const defaultPath = '../tronbox/build'
const clonePath = `${defaultPath}/UpgradeableProxy.json`
const factoryPath = `${defaultPath}/TronUniversalFactory.json`
const withdrawalPath = `${defaultPath}/UniversalWithdrawal.json`

const conf = {
  feeLimit: 1_000_000_000, // Set the fee limit
  callValue: 0, // Set the call value to 0
}

describe('Tron test', function () {
  const { ethers } = hre
  const { ZeroAddress } = ethers

  const transferAmount = 1e10
  const salt = ethers.id(randomUUID())
  const salt2 = ethers.id(randomUUID())
  const cloneAbi = JSON.parse(fs.readFileSync(resolve(__dirname, clonePath)).toString()).abi

  let tronWebOwner: TronWeb
  let ownerAddress: string

  let bobAddress: string

  let tronWebAlice: TronWeb

  let janeAddress: string

  let defaultFactory: Contract
  let defaultFactoryAddress: string

  let universalWithdrawal: Contract
  let universalWithdrawalAddress: string

  let cloneContract: Contract
  let cloneAddressHex: string
  let cloneAddressHex2: string

  let tronTestToken: Contract
  let tronTestTokenNoBool: Contract

  let tokenAddress: string
  let tokenNoBoolAddress: string

  before(async function () {
    await prepareSignersTron({ thisObject: this, tronUrl })
    const { owner, bob, alice, jane } = this
    tronWebOwner = owner
    tronWebAlice = alice

    await prepareContractsTron(this)

    ownerAddress = tronWebOwner.defaultAddress.base58 as string
    bobAddress = bob.defaultAddress.base58 as string
    janeAddress = jane.defaultAddress.base58 as string

    const balance = await tronWebOwner.trx.getBalance(ownerAddress)
    console.log('Account balance:', balance)

    defaultFactory = this.tronUniversalFactory
    defaultFactoryAddress = defaultFactory.address as string

    universalWithdrawal = this.tronUniversalWithdrawal
    universalWithdrawalAddress = universalWithdrawal.address as string

    const predictedAddress = await defaultFactory.predictAddress(salt).call()
    await defaultFactory.createClone(salt).send()
    cloneAddressHex = predictedAddress.predictedAddress
    cloneContract = tronWebOwner.contract(cloneAbi, cloneAddressHex)

    const predictedAddress2 = await defaultFactory.predictAddress(salt2).call()
    await defaultFactory.createClone(salt2).send()
    cloneAddressHex2 = predictedAddress2.predictedAddress

    tronTestToken = this.tronTestToken
    tronTestTokenNoBool = this.tronTestTokenNoBool

    tokenAddress = tronTestToken.address as string
    tokenNoBoolAddress = tronTestTokenNoBool.address as string
  })

  after(function () {
    process.exit(0)
  })

  describe('Test #0 - Contract Deployment and Functionality', function () {
    it('Test #0.0 - should log the predicted address and verify ownership', async function () {
      // Verifying the ownership of the defaultFactory
      expect(ownerAddress).to.be.equal(tronWebOwner.address.fromHex(await defaultFactory.owner().call()))
      expect(defaultFactoryAddress).to.be.equal(await defaultFactory.factory().call())
      expect(cloneAddressHex).to.be.equal(cloneContract.address as string)

      // Ensuring that initialization cannot be done twice
      try {
        await cloneContract.methods.initProxy(ownerAddress, defaultFactoryAddress, universalWithdrawalAddress).send()
        expect.fail('Expected transaction to revert with: Initializable: contract is already initialized')
      } catch (err: any) {
        if (err.message.includes('Initializable')) {
          console.log('Test passed: CustomError "Initializable" thrown')
        } else {
          expect.fail(`Unexpected error: ${err.message}`)
        }
      }
    })

    it('Test #0.1 - should deposit ETH and verify withdrawal to bob', async function () {
      // Alice sends ETH to the clone wallet
      await tronWebOwner.trx.send(cloneAddressHex, transferAmount)
      await sleep(7000)
      expect(await tronWebOwner.trx.getBalance(cloneAddressHex)).to.be.equal(transferAmount)

      // Bob's balance before the withdrawal
      const bobBalanceBefore = await tronWebOwner.trx.getBalance(bobAddress)

      // Withdraw ETH to Bob via proxy
      const receipt = await callProxyTron({
        tronWeb: tronWebOwner,
        proxyAddress: cloneAddressHex,
        getDataInput: {
          method: WithdrawalMethods.withdraw,
          data: {
            recipients: [bobAddress],
            amounts: [transferAmount],
          },
        },
      })

      // Опционально: Проверка выполнения транзакции
      await tronWebOwner.trx.getTransactionInfo(receipt.transaction.txID)
      await sleep(7000)

      const bobBalanceAfter = await tronWebOwner.trx.getBalance(bobAddress)
      expect(bobBalanceAfter - bobBalanceBefore).to.be.equal(transferAmount)
      expect(await tronWebOwner.trx.getBalance(cloneAddressHex)).to.be.equal(0)
    })

    it('Test #0.3 - should deposit and withdraw ERC20 tokens', async function () {
      // Transfer ERC20 tokens to the clone wallet
      expect(await tronTestToken.balanceOf(cloneAddressHex).call()).to.be.equal(0)

      // Alice sends ERC20 tokens to the UniversalWithdrawal contract
      await tronTestToken.transfer(cloneAddressHex, transferAmount).send()

      const b = await tronTestToken.balanceOf(cloneAddressHex).call()
      const c = await tronTestToken.balanceOf(bobAddress).call()
      expect(b).to.be.equal(transferAmount)

      // Withdraw ERC20 tokens to Bob
      const receipt = await callProxyTron({
        tronWeb: tronWebOwner,
        proxyAddress: cloneAddressHex,
        getDataInput: {
          method: WithdrawalMethods.withdrawERC20,
          data: {
            token: tokenAddress,
            recipient: bobAddress,
            amount: transferAmount,
          },
        },
      })
      await tronWebOwner.trx.getTransactionInfo(receipt.transaction.txID)

      const b2 = await tronTestToken.balanceOf(cloneAddressHex).call()
      const c2 = await tronTestToken.balanceOf(bobAddress).call()
      expect(b - b2).to.be.equal(transferAmount)
      expect(c2 - c).to.be.equal(transferAmount)
      expect(b2).to.be.equal(0)
    })

    it('Test #0.4 - should deposit and withdraw ERC20 tokens (alternative token)', async function () {
      // Transfer ERC20 tokens to the clone wallet
      expect(await tronTestTokenNoBool.balanceOf(cloneAddressHex).call()).to.be.equal(0)
      // Alice sends ERC20 tokens to the cloneContract contract
      await tronTestTokenNoBool.transfer(cloneAddressHex, transferAmount).send()

      const b = await tronTestTokenNoBool.balanceOf(cloneAddressHex).call()
      const c = await tronTestTokenNoBool.balanceOf(bobAddress).call()
      expect(b).to.be.equal(transferAmount)

      // Withdraw ERC20 tokens to Bob
      const receipt = await callProxyTron({
        tronWeb: tronWebOwner,
        proxyAddress: cloneAddressHex,
        getDataInput: {
          method: WithdrawalMethods.withdrawERC20,
          data: {
            token: tokenNoBoolAddress,
            recipient: bobAddress,
            amount: transferAmount,
          },
        },
      })
      await tronWebOwner.trx.getTransactionInfo(receipt.transaction.txID)

      const b2 = await tronTestTokenNoBool.balanceOf(cloneAddressHex).call()
      const c2 = await tronTestTokenNoBool.balanceOf(bobAddress).call()
      expect(b - b2).to.be.equal(transferAmount)
      expect(c2 - c).to.be.equal(transferAmount)
      expect(b2).to.be.equal(0)
    })

    it('Test #0.5 - should test the upgradable UniversalWithdrawal proxy contract', async function () {
      // Deploy the UniversalWithdrawal contract
      const { abi: wabi, bytecode: wbytecode } = JSON.parse(fs.readFileSync(resolve(__dirname, withdrawalPath)).toString())
      const { abi: fabi, bytecode: fbytecode } = JSON.parse(fs.readFileSync(resolve(__dirname, factoryPath)).toString())

      const contractWithdrawal = await tronWebOwner.contract().new({
        abi: wabi,
        bytecode: wbytecode,
        ...conf,
      })
      const contractWithdrawalAddress = contractWithdrawal.address as string

      // Verify initial `withdrawal` value in proxy
      expect(await cloneContract.methods.withdrawal().call()).to.be.equal(universalWithdrawalAddress)

      // Update `withdrawal` in proxy and verify the change
      await cloneContract.methods.updateWithdrawal(contractWithdrawalAddress).send()

      // Ensure the proxy's initial withdrawal implementation is correctly set
      expect(await cloneContract.methods.withdrawal().call()).to.be.equal(contractWithdrawalAddress)

      // Deploy UniversalFactory contract
      const contractFactory = await tronWebOwner.contract().new({
        abi: fabi,
        bytecode: fbytecode,
        parameters: [contractWithdrawalAddress],
        ...conf,
      })
      const contractFactoryAddress = contractFactory.address as string

      // Verify initial `factory` value in proxy
      expect(await cloneContract.methods.factory().call()).to.be.equal(defaultFactoryAddress)

      // Update `factory` in proxy and verify the change
      await cloneContract.methods.updateFactory(contractFactoryAddress).send()

      // Ensure the proxy's initial factory value is correctly set
      expect(await cloneContract.methods.factory().call()).to.be.equal(contractFactoryAddress)
    })
  })

  describe('Test #1 - Asset Withdrawal from Multiple Cloned Addresses', function () {
    let bobBalanceBefore1: bigint
    let bobBalanceBefore2: bigint

    beforeEach(async function () {
      // Transfer test ERC20 tokens to the clone contract
      await tronTestToken.transfer(cloneAddressHex, transferAmount).send()

      // Transfer another ERC20 token (tronTestTokenNoBool) to the clone contract
      await tronTestTokenNoBool.transfer(cloneAddressHex, transferAmount).send()

      // Store Bob's balance before the transfers
      bobBalanceBefore1 = await tronTestToken.balanceOf(bobAddress).call()
      bobBalanceBefore2 = await tronTestTokenNoBool.balanceOf(bobAddress).call()
    })

    it('Test #1.1 - Universal Transfer Success and Failure for Different Tokens', async function () {
      // Test that the universal transfer works for the first token (tronTestToken)

      await expect(
        callProxyTron({
          tronWeb: tronWebOwner,
          proxyAddress: cloneAddressHex,
          getDataInput: {
            method: WithdrawalMethods.universalTransfer,
            data: {
              token: tokenAddress,
              to: bobAddress,
              amount: transferAmount,
              transferType: '0',
            },
          },
          allowThrow: false,
        }),
      ).to.be.ok

      // Test that the universal transfer fails for the second token (tronTestTokenNoBool)
      // expect(

      expect(
        await callProxyTron({
          tronWeb: tronWebOwner,
          proxyAddress: cloneAddressHex,
          getDataInput: {
            method: WithdrawalMethods.universalTransfer,
            data: {
              token: tokenNoBoolAddress,
              to: bobAddress,
              amount: transferAmount,
              transferType: '0',
            },
          },
          allowThrow: false,
        }),
      ).to.be.revertedWithoutReason()

      expect(await tronTestTokenNoBool.balanceOf(cloneAddressHex).call()).to.be.equal(transferAmount)
    })

    it("Test #1.2 - Universal Transfer for Different Tokens with Mode '1'", async function () {
      // Perform a universal transfer for the first token (tronTestToken) and verify balance change
      const receipt = await callProxyTron({
        tronWeb: tronWebOwner,
        proxyAddress: cloneAddressHex,
        getDataInput: {
          method: WithdrawalMethods.universalTransfer,
          data: {
            token: tokenAddress,
            to: bobAddress,
            amount: transferAmount,
            transferType: '1',
          },
        },
      })
      // Use sendTransaction to proxy
      await tronWebOwner.trx.getTransactionInfo(receipt.transaction.txID)

      // Perform a universal transfer for the second token (tronTestTokenNoBool) and verify balance change

      const receipt2 = await callProxyTron({
        tronWeb: tronWebOwner,
        proxyAddress: cloneAddressHex,
        getDataInput: {
          method: WithdrawalMethods.universalTransfer,
          data: {
            token: tokenNoBoolAddress,
            to: bobAddress,
            amount: transferAmount * 2,
            transferType: '1',
          },
        },
        allowThrow: false,
      })
      // Use sendTransaction to proxy
      await tronWebOwner.trx.getTransactionInfo(receipt2.transaction.txID)

      // Get Bob's balance after the transfers
      const bobBalanceAfter1 = await tronTestToken.balanceOf(bobAddress).call()
      const bobBalanceAfter2 = await tronTestTokenNoBool.balanceOf(bobAddress).call()

      // Verify the balance increase for both tokens
      expect(bobBalanceAfter1 - bobBalanceBefore1).to.be.equal(transferAmount)
      expect(bobBalanceAfter2 - bobBalanceBefore2).to.be.equal(transferAmount * 2)
    })

    it("Test #1.3 - Universal Transfer for Different Tokens with Mode '2'", async function () {
      // Perform a universal transfer for the first token (tronTestToken) with a different transfer mode ("2")
      const receipt = await callProxyTron({
        tronWeb: tronWebOwner,
        proxyAddress: cloneAddressHex,
        getDataInput: {
          method: WithdrawalMethods.universalTransfer,
          data: {
            token: tokenAddress,
            to: bobAddress,
            amount: transferAmount,
            transferType: '2',
          },
        },
      })
      // Use sendTransaction to proxy
      await tronWebOwner.trx.getTransactionInfo(receipt.transaction.txID)

      // Perform a universal transfer for the second token (tronTestTokenNoBool) with the same mode ("2")
      const receipt2 = await callProxyTron({
        tronWeb: tronWebOwner,
        proxyAddress: cloneAddressHex,
        getDataInput: {
          method: WithdrawalMethods.universalTransfer,
          data: {
            token: tokenNoBoolAddress,
            to: bobAddress,
            amount: transferAmount,
            transferType: '2',
          },
        },
      })
      // Use sendTransaction to proxy
      await tronWebOwner.trx.getTransactionInfo(receipt2.transaction.txID)

      // Get Bob's balance after the transfers
      const bobBalanceAfter1 = await tronTestToken.balanceOf(bobAddress).call()
      const bobBalanceAfter2 = await tronTestTokenNoBool.balanceOf(bobAddress).call()

      // Verify the balance increase for both tokens
      expect(bobBalanceAfter1 - bobBalanceBefore1).to.be.equal(transferAmount)
      expect(bobBalanceAfter2 - bobBalanceBefore2).to.be.equal(transferAmount)

      expect(await tronTestToken.balanceOf(cloneAddressHex).call()).to.be.equal(0)
      expect(await tronTestTokenNoBool.balanceOf(cloneAddressHex).call()).to.be.equal(0)
    })
  })

  describe('Test #2 - Asset Withdrawal for Multiple Users from Different Tokens', function () {
    let janeBalanceBefore1: bigint
    let janeBalanceBefore2: bigint

    before(async function () {
      // Transfer ERC20 tokens to the clone contract
      await tronTestToken.transfer(cloneAddressHex, transferAmount).send()

      // Transfer another ERC20 token (tronTestTokenNoBool) to the clone contract
      await tronTestTokenNoBool.transfer(cloneAddressHex, transferAmount).send()

      // Store Jane's balance before the withdrawals
      janeBalanceBefore1 = await tronTestToken.balanceOf(janeAddress).call()
      janeBalanceBefore2 = await tronTestTokenNoBool.balanceOf(janeAddress).call()
    })

    it('Test #2.1 - Withdraw Many ERC20 Tokens to Jane and Verify Balances', async function () {
      // Check the initial balance of the clone contract
      const b = await tronTestToken.balanceOf(cloneAddressHex).call()
      expect(b).to.be.equal(transferAmount)

      const c = await tronTestTokenNoBool.balanceOf(cloneAddressHex).call()
      expect(c).to.be.equal(transferAmount)

      // Perform a withdrawal of both ERC20 tokens to Jane
      const receipt = await callProxyTron({
        tronWeb: tronWebOwner,
        proxyAddress: cloneAddressHex,
        getDataInput: {
          method: WithdrawalMethods.withdrawManyERC20,
          data: {
            tokens: [tokenAddress, tokenNoBoolAddress],
            recipients: [janeAddress, janeAddress],
            amounts: [transferAmount, transferAmount],
          },
        },
      })
      // Use sendTransaction to proxy
      await tronWebOwner.trx.getTransactionInfo(receipt.transaction.txID)

      // Get Jane's balance after the withdrawal
      const janeBalanceAfter1 = await tronTestToken.balanceOf(janeAddress).call()
      const janeBalanceAfter2 = await tronTestTokenNoBool.balanceOf(janeAddress).call()

      // Verify Jane's balance has increased by the withdrawn amount
      expect(janeBalanceAfter1 - janeBalanceBefore1).to.be.equal(transferAmount)
      expect(janeBalanceAfter2 - janeBalanceBefore2).to.be.equal(transferAmount)

      // Check the balance of the clone contract after the withdrawal
      const b1 = await tronTestToken.balanceOf(cloneAddressHex).call()
      const c1 = await tronTestTokenNoBool.balanceOf(cloneAddressHex).call()

      // Verify that the balances of the clone contract have decreased by the withdrawn amount
      expect(b - b1).to.be.equal(transferAmount)
      expect(c - c1).to.be.equal(transferAmount)

      // Verify the clone contract's balances are now 0
      expect(b1).to.be.equal(0)
      expect(c1).to.be.equal(0)
    })

    // Additional edge case: withdrawing zero tokens
    it('Test #2.2 - Withdraw Zero Tokens', async function () {
      // Check Jane's balance before zero withdrawal
      const janeBalanceBeforeZero = await tronTestToken.balanceOf(janeAddress).call()

      // Attempt to withdraw zero tokens
      const receipt = await callProxyTron({
        tronWeb: tronWebOwner,
        proxyAddress: cloneAddressHex,
        getDataInput: {
          method: WithdrawalMethods.withdrawManyERC20,
          data: {
            tokens: [tokenAddress],
            recipients: [janeAddress],
            amounts: [0],
          },
        },
      })
      // Use sendTransaction to proxy
      await tronWebOwner.trx.getTransactionInfo(receipt.transaction.txID)

      // Check Jane's balance after zero withdrawal (should remain the same)
      const janeBalanceAfterZero = await tronTestToken.balanceOf(janeAddress).call()
      expect(janeBalanceAfterZero).to.be.equal(janeBalanceBeforeZero)
      expect(await tronTestToken.balanceOf(cloneAddressHex).call()).to.be.equal(0)
      expect(await tronTestTokenNoBool.balanceOf(cloneAddressHex).call()).to.be.equal(0)
    })
  })

  describe('Test #3 - Error Handling for Asset Withdrawal from Multiple Cloned Addresses', function () {
    let janeBalanceBefore1: bigint
    let janeBalanceBefore2: bigint

    before(async function () {
      // Transfer ERC20 tokens to the clone contract at cloneAddressHex
      await tronTestToken.transfer(cloneAddressHex, transferAmount).send()

      // Transfer ERC20 tokens to the clone contract at cloneAddressHex2
      await tronTestToken.transfer(cloneAddressHex2, transferAmount).send()

      // Transfer ERC20 tokens (tronTestTokenNoBool) to cloneAddressHex2
      await tronTestTokenNoBool.transfer(cloneAddressHex2, transferAmount).send()

      // Store Jane's balance before the withdrawals
      janeBalanceBefore1 = await tronTestToken.balanceOf(janeAddress).call()
      janeBalanceBefore2 = await tronTestTokenNoBool.balanceOf(janeAddress).call()

      // Send ETH to the clone contract at cloneAddressHex
      await tronWebOwner.trx.send(cloneAddressHex, transferAmount)

      // Send ETH to the clone contract at cloneAddressHex2
      await tronWebOwner.trx.send(cloneAddressHex2, transferAmount * 2)

      // Optional: Wait for the transactions to be mined
      await sleep(7000)
    })

    it('Test #3.1 - Withdraw Assets from Multiple Clones and Validate Balances', async function () {
      expect(defaultFactoryAddress).to.be.equal(await defaultFactory.factory().call())
      // Verify token balances in the clone contracts
      expect(await tronTestToken.balanceOf(cloneAddressHex).call()).to.be.equal(transferAmount)
      expect(await tronTestToken.balanceOf(cloneAddressHex2).call()).to.be.equal(transferAmount)
      expect(await tronTestTokenNoBool.balanceOf(cloneAddressHex2).call()).to.be.equal(transferAmount)

      // Verify ETH balances in the clone contracts
      const b1 = await tronWebOwner.trx.getBalance(cloneAddressHex)
      const b2 = await tronWebOwner.trx.getBalance(cloneAddressHex2)

      expect(b1).to.be.equal(transferAmount)
      expect(b2).to.be.equal(transferAmount * 2)

      // Test invalid withdraw requests
      try {
        await defaultFactory.withdrawAssetsFromClones([cloneAddressHex, cloneAddressHex2], [0], janeAddress, ZeroAddress).send()
        expect.fail('Expected transaction to revert with ArrayLengthMismatch')
      } catch (err: any) {
        if (err.message.includes('ArrayLengthMismatch')) {
          console.log('Test passed: CustomError "ArrayLengthMismatch" thrown')
        } else {
          expect.fail(`Unexpected error: ${err.message}`)
        }
      }

      try {
        await defaultFactory.withdrawAssetsFromClones([cloneAddressHex, ZeroAddress], [0, 0], janeAddress, ZeroAddress).send()
        expect.fail('Expected transaction to revert with InvalidCloneAddressHex')
      } catch (err: any) {
        if (err.message.includes('InvalidCloneAddressHex')) {
          console.log('Test passed: CustomError "InvalidCloneAddressHex" thrown')
        } else {
          expect.fail(`Unexpected error: ${err.message}`)
        }
      }

      try {
        await defaultFactory.withdrawAssetsFromClones([cloneAddressHex, cloneAddressHex2], [0, 0], ZeroAddress, ZeroAddress).send()
        expect.fail('Expected transaction to revert with InvalidAddressRecipient')
      } catch (err: any) {
        if (err.message.includes('InvalidAddressRecipient')) {
          console.log('Test passed: CustomError "InvalidAddressRecipient" thrown')
        } else {
          expect.fail(`Unexpected error: ${err.message}`)
        }
      }

      // Perform the withdrawal of assets from the clones to Jane's address
      await defaultFactory.withdrawAssetsFromClones([cloneAddressHex], [transferAmount], janeAddress, tokenAddress).send()

      // Withdraw assets from the second clone (cloneAddressHex2) for both tokens
      for (const t of [tokenAddress, tokenNoBoolAddress]) {
        await defaultFactory.withdrawAssetsFromClones([cloneAddressHex2], [transferAmount], janeAddress, t).send()
      }

      // Withdraw ETH from both clones (cloneAddressHex and cloneAddressHex2)
      try {
        await defaultFactory
          .withdrawAssetsFromClones([cloneAddressHex, cloneAddressHex2], [transferAmount * 2, 0], janeAddress, ZeroAddress)
          .send()
        expect.fail('Expected transaction to revert with WithdrawFailed')
      } catch (err: any) {
        if (err.message.includes('WithdrawFailed')) {
          console.log('Test passed: CustomError "WithdrawFailed" thrown')
        } else {
          expect.fail(`Unexpected error: ${err.message}`)
        }
      }

      await defaultFactory
        .withdrawAssetsFromClones([cloneAddressHex, cloneAddressHex2], [transferAmount, transferAmount * 2], janeAddress, ZeroAddress)
        .send()

      // Optional: Wait for the transactions to be confirmed
      await sleep(7000)

      // Get Jane's balance after the withdrawals
      const janeBalanceAfter1 = await tronTestToken.balanceOf(janeAddress).call()
      const janeBalanceAfter2 = await tronTestTokenNoBool.balanceOf(janeAddress).call()

      // Verify that Jane's balance has increased by the total withdrawn amounts
      expect(janeBalanceAfter1 - janeBalanceBefore1).to.be.equal(transferAmount * 2)
      expect(janeBalanceAfter2 - janeBalanceBefore2).to.be.equal(transferAmount)

      // Verify that the clone contracts' balances are now zero
      expect(await tronTestToken.balanceOf(cloneAddressHex).call()).to.be.equal(0)
      expect(await tronTestToken.balanceOf(cloneAddressHex2).call()).to.be.equal(0)
      expect(await tronTestTokenNoBool.balanceOf(cloneAddressHex2).call()).to.be.equal(0)

      // Verify that the ETH balances of the clone contracts are now zero
      expect(await tronWebOwner.trx.getBalance(cloneAddressHex)).to.be.equal(0)
      expect(await tronWebOwner.trx.getBalance(cloneAddressHex2)).to.be.equal(0)
    })
  })

  describe('Test #4 - ERC20 Token Transfer and Withdrawal via Proxy', function () {
    before(async function () {
      // Ensure the initial balance of the proxy is zero
      expect(await tronTestToken.balanceOf(cloneAddressHex).call()).to.be.equal(0)

      // Alice sends ERC20 tokens to the UniversalWithdrawal contract
      await tronTestToken.transfer(cloneAddressHex, transferAmount).send()
    })

    it('Test #4.1 - Withdraw ERC20 Tokens to Bob', async function () {
      // Check initial balances
      const b = await tronTestToken.balanceOf(cloneAddressHex).call()
      const c = await tronTestToken.balanceOf(bobAddress).call()
      expect(b).to.be.equal(transferAmount)
      const aliceAddress = tronWebAlice.defaultAddress.base58 as string

      // Verify Alice is not an admin initially
      expect(await cloneContract.isAdmined(aliceAddress).call()).to.be.equal(false)

      // Attempt to withdraw without admin rights, expect failure
      expect(
        await callProxyTron({
          tronWeb: tronWebAlice,
          proxyAddress: cloneAddressHex,
          getDataInput: {
            method: WithdrawalMethods.withdrawERC20,
            data: {
              token: tokenAddress,
              recipient: bobAddress,
              amount: transferAmount,
            },
          },
          allowThrow: false,
        }),
      ).to.be.revertedWithoutReason()

      // Grant admin rights to Alice
      await cloneContract.setAdmin([aliceAddress], true).send()
      expect(await cloneContract.isAdmined(aliceAddress).call()).to.be.equal(true)

      // Successfully withdraw tokens as admin
      // Withdraw ERC20 tokens to Bob
      const receipt = await callProxyTron({
        tronWeb: tronWebAlice,
        proxyAddress: cloneAddressHex,
        getDataInput: {
          method: WithdrawalMethods.withdrawERC20,
          data: {
            token: tokenAddress,
            recipient: bobAddress,
            amount: transferAmount,
          },
        },
      })
      await tronWebOwner.trx.getTransactionInfo(receipt.transaction.txID)

      // Verify balances after withdrawal
      const b2 = await tronTestToken.balanceOf(cloneAddressHex).call()
      const c2 = await tronTestToken.balanceOf(bobAddress).call()
      expect(b - b2).to.be.equal(transferAmount)
      expect(c2 - c).to.be.equal(transferAmount)
      expect(b2).to.be.equal(0)
    })
  })
})
