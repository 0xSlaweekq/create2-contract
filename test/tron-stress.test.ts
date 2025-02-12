import { randomUUID } from "node:crypto"

import { expect } from "chai"
import dotenv from "dotenv"
import hre from "hardhat"
import { resolve } from "path"
import { Contract, TronWeb } from "tronweb"

import { getError, sleep } from "../utils/utils"
import { prepareContractsTron, prepareSignersTron } from "./helpers"

const envConfig = dotenv.config({ path: resolve("./", ".env") })
const { PORT_TRON } = envConfig.parsed || {}

const tronUrl = `http://0.0.0.0:${PORT_TRON}`

describe("Tron stress test", function () {
    const { ethers } = hre
    const { ZeroAddress } = ethers

    const depositAmount = 1e8
    const transferAmount = 1e9

    let tronWebOwner: TronWeb
    let ownerAddress: string

    let tronWebAlice: TronWeb
    let janeAddress: string

    let universalFactory: Contract
    let universalWithdrawal: Contract
    let testToken: Contract
    let tokenAddress: string

    before(async function () {
        await prepareSignersTron({ thisObject: this, tronUrl })
        const { owner, bob, alice, jane } = this
        tronWebOwner = owner
        tronWebAlice = alice

        await prepareContractsTron(this)

        ownerAddress = tronWebOwner.defaultAddress.base58 as string
        janeAddress = jane.defaultAddress.base58 as string

        const balance = await tronWebOwner.trx.getBalance(ownerAddress)
        console.log("Account balance:", balance)

        universalFactory = this.tronUniversalFactory
        universalWithdrawal = this.tronUniversalWithdrawal
        testToken = this.tronTestToken
        tokenAddress = testToken.address as string
    })

    after(function () {
        process.exit(0)
    })

    describe("Test #0 - Stress for withdrawAssetsFromClones", function () {
        const countTests = 50
        let proxyAddresses: string[] = []
        const transferAmounts: number[] = []
        const depositAmounts: number[] = []
        let janeBalanceBefore1: bigint

        before(async function () {
            console.log("Start creating clones:")
            for (let i = 0; i < countTests; ++i) {
                console.log(
                    `Create ${i + 1} clone, send ${ethers.formatUnits(transferAmount.toString(), 8)} tokens and deposit ${ethers.formatUnits(depositAmount.toString(), 8)} TRX`,
                )

                const salt = ethers.id(randomUUID())

                const p = await universalFactory.predictAddress(salt).call()
                await universalFactory.createClone(salt).send()
                const a = tronWebOwner.address.fromHex(p.predictedAddress)

                proxyAddresses[proxyAddresses.length] = a
                transferAmounts[transferAmounts.length] = transferAmount
                depositAmounts[depositAmounts.length] = depositAmount

                // Store Jane's balance before the withdrawals
                await testToken.transfer(a, transferAmount).send()
                await sleep(500)

                // Send ETH to the clone contract at upgradeableProxyAddress
                await tronWebOwner.trx.send(a, depositAmount)
            }
            console.log("End creating clones")

            // Store Jane's balance before the withdrawals
            janeBalanceBefore1 = await testToken.balanceOf(janeAddress).call()

            // Optional: Wait for the transactions to be mined
            await sleep(7000)
        })

        it("Test #0.1 - ", async function () {
            try {
                // Verify token balances in the clone contracts
                let i: number = 0
                for (const pA of proxyAddresses) {
                    console.log(i + 1)
                    expect(await testToken.balanceOf(pA).call()).to.be.equal(transferAmount)
                    const b1 = await tronWebOwner.trx.getBalance(pA)
                    expect(b1).to.be.equal(depositAmount)
                    ++i
                }

                // Perform the withdrawal of assets from the clones to Jane's address
                await universalFactory.withdrawAssetsFromClones(proxyAddresses, transferAmounts, janeAddress, tokenAddress).send()
                proxyAddresses = proxyAddresses.map(a => tronWebOwner.address.fromHex(a))
                await sleep(7000)

                await universalFactory.withdrawAssetsFromClones(proxyAddresses, depositAmounts, janeAddress, ZeroAddress).send()
                proxyAddresses = proxyAddresses.map(a => tronWebOwner.address.fromHex(a))

                // Optional: Wait for the transactions to be confirmed
                await sleep(10000)

                // Get Jane's balance after the withdrawals
                const janeBalanceAfter1 = await testToken.balanceOf(janeAddress).call()
                console.log({ janeBalanceAfter1 })

                // Verify that Jane's balance has increased by the total withdrawn amounts
                expect(janeBalanceAfter1 - janeBalanceBefore1).to.be.equal(transferAmounts.reduce((a, b) => a + b))

                for (const pA of proxyAddresses) {
                    // Verify that the clone contracts' balances are now zero
                    expect(await testToken.balanceOf(pA).call()).to.be.equal(0)

                    // Verify that the ETH balances of the clone contracts are now zero
                    const b2 = await tronWebOwner.trx.getBalance(pA)
                    expect(b2).to.be.equal(0)
                }
            } catch (e: any) {
                await getError({ e })
            }
        })
    })
})
