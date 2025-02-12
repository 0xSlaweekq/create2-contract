import { randomUUID } from "node:crypto"

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { BaseContract, ContractFactory } from "ethers"
import hre from "hardhat"

import { TestToken, TestTokenNoBool, UniversalFactory, UpgradeableProxy, UpgradeableProxy__factory } from "../build/typechain"
import { prepareContracts, prepareSigners } from "./helpers"

describe("BSC stress test", function () {
    const { ethers } = hre
    const { ZeroAddress } = ethers

    const depositAmount = ethers.parseEther("0.1")
    const amount = ethers.parseEther("1000000")
    const transferAmount = ethers.parseEther("10")

    let owner: SignerWithAddress
    let alice: SignerWithAddress
    let jane: SignerWithAddress

    let universalFactory: UniversalFactory
    let testToken: TestToken
    let testTokenNoBool: TestTokenNoBool

    let tokenAddress: string
    let tokenNoBoolAddress: string

    let upgradeableProxyFactory: UpgradeableProxy__factory

    before(async function () {
        await prepareSigners(this)
        ;[owner, alice, , , jane] = this.signers
        await prepareContracts({ thisObject: this, chain: 1 })
        universalFactory = this.universalFactory
        testToken = this.testToken
        testTokenNoBool = this.testTokenNoBool

        await testToken.mint(alice.address, amount)
        await testTokenNoBool.mint(alice.address, amount)

        upgradeableProxyFactory = (await ethers.getContractFactory("UpgradeableProxy")) as ContractFactory as UpgradeableProxy__factory

        tokenAddress = await testToken.getAddress()
        tokenNoBoolAddress = await testTokenNoBool.getAddress()
    })

    after(function () {
        process.exit(0)
    })

    describe("Test #0 - Stress for withdrawAssetsFromClones", function () {
        const countTests = 450
        const proxyAddresses: string[] = []
        const transferAmounts: bigint[] = []
        const depositAmounts: bigint[] = []
        let janeBalanceBefore1: bigint

        before(async function () {
            console.log("Start creating clones:")
            for (let i = 0; i < countTests; ++i) {
                console.log(
                    `Create ${i + 1} clone, send ${ethers.formatUnits(transferAmount.toString(), 18)} tokens and deposit ${ethers.formatUnits(depositAmount.toString(), 18)} native`,
                )

                const salt = ethers.id(randomUUID())
                const p = await universalFactory.predictAddress(salt)
                const clone = await universalFactory.connect(owner).createClone(salt)
                await clone.wait()

                const uP = upgradeableProxyFactory.attach(p) as BaseContract as UpgradeableProxy
                const a = await uP.getAddress()

                proxyAddresses[proxyAddresses.length] = a
                transferAmounts[transferAmounts.length] = transferAmount
                depositAmounts[depositAmounts.length] = depositAmount

                const txn = await testToken.connect(alice).transfer(a, transferAmount)
                await txn.wait()

                // Send ETH to the clone contract at upgradeableProxyAddress
                const txn4 = await alice.sendTransaction({
                    to: a,
                    value: depositAmount,
                })
                await txn4.wait()
            }
            console.log("End creating clones")

            // Store Jane's balance before the withdrawals
            janeBalanceBefore1 = await testToken.balanceOf(jane.address)
        })

        it("Test #0.1 - ", async function () {
            // Verify token balances in the clone contracts
            for (const pA of proxyAddresses) {
                expect(await testToken.balanceOf(pA)).to.be.equal(transferAmount)
                const b1 = await ethers.provider.getBalance(pA)
                expect(b1).to.be.equal(depositAmount)
            }

            // Perform the withdrawal of assets from the clones to Jane's address
            const txn = await universalFactory
                .connect(owner)
                .withdrawAssetsFromClones(proxyAddresses, transferAmounts, jane.address, tokenAddress)
            await txn.wait()

            const txn2 = await universalFactory
                .connect(owner)
                .withdrawAssetsFromClones(proxyAddresses, depositAmounts, jane.address, ZeroAddress)
            await txn2.wait()

            // Get Jane's balance after the withdrawals
            const janeBalanceAfter1 = await testToken.balanceOf(jane.address)
            console.log({ janeBalanceAfter1: ethers.formatUnits(janeBalanceAfter1.toString(), 18) })

            // Verify that Jane's balance has increased by the total withdrawn amounts
            expect(janeBalanceAfter1 - janeBalanceBefore1).to.be.equal(transferAmounts.reduce((a, b) => a + b))

            for (const pA of proxyAddresses) {
                // Verify that the clone contracts' balances are now zero
                expect(await testToken.balanceOf(pA)).to.be.equal(0)
                // Verify that the ETH balances of the clone contracts are now zero
                expect(await ethers.provider.getBalance(pA)).to.be.equal(0)
            }
        })
    })
})
