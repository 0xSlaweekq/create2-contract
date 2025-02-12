import { BaseContract, MaxUint256 } from "ethers"
import { ethers } from "hardhat"

import {
    MockSwapRouter,
    MockToken,
    MockUniswapV2Router,
    MockWETH,
    TestToken,
    TestTokenNoBool,
    UniversalFactory,
    UniversalWithdrawal,
} from "../../../build/typechain"
import { deployHelper } from "./deploy.helper"

export async function prepareSigners(thisObject: Mocha.Context) {
    thisObject.signers = await ethers.getSigners()

    thisObject.owner = thisObject.signers[0]
    thisObject.alice = thisObject.signers[1]
    thisObject.bob = thisObject.signers[2]
    thisObject.jane = thisObject.signers[4]
}

export async function prepareContracts({ thisObject, chain }: { thisObject: Mocha.Context; chain: number }) {
    console.log("Deploy:")
    const contracts = await deployHelper(chain)

    if (!contracts.mockContracts) {
        throw Error("need mock mode!")
    }
    const { weth, usdc, usdt } = contracts.mockContracts.tokens

    const { universalFactory, universalWithdrawal, testToken, testTokenNoBool } = contracts.deployedContracts

    thisObject.universalFactory = universalFactory as BaseContract as UniversalFactory
    thisObject.universalWithdrawal = universalWithdrawal as BaseContract as UniversalWithdrawal
    thisObject.testToken = testToken as BaseContract as TestToken
    thisObject.testTokenNoBool = testTokenNoBool as BaseContract as TestTokenNoBool

    if (chain === 1) {
        const uniV2router = contracts.mockContracts?.defies[0].addresses[1]
        if (!uniV2router) {
            throw Error("need uniV2 router!")
        }
        thisObject.uniV2Router = (await ethers.getContractAt("MockUniswapV2Router", uniV2router)) as BaseContract as MockUniswapV2Router

        const uniV3router = contracts.mockContracts?.defies[1].addresses[1]
        if (!uniV3router) {
            throw Error("need uniV3 router!")
        }
        thisObject.uniV3Router = (await ethers.getContractAt("MockSwapRouter", uniV3router)) as BaseContract as MockSwapRouter
    } else if (chain === 56) {
        const pancakeRouter = contracts.mockContracts?.defies[0].addresses[1]
        if (!pancakeRouter) {
            throw Error("need pancake router!")
        }
        thisObject.pancakeswapRouter = (await ethers.getContractAt("MockUniswapV2Router", pancakeRouter)) as BaseContract as MockUniswapV2Router
    }

    thisObject.weth = (await ethers.getContractAt("MockWETH", weth)) as BaseContract as MockWETH
    // thisObject.usdc = (await ethers.getContractAt("MockToken", usdc)) as BaseContract as MockToken
    thisObject.usdt = (await ethers.getContractAt("MockToken", usdt)) as BaseContract as MockToken

    const { owner } = thisObject

    // getting usdc and usdt
    const nativeAmount = ethers.parseUnits("50", 18)
    const balanceWeth = await thisObject.weth.balanceOf(thisObject.owner.address)
    if (balanceWeth < ethers.parseUnits("1", 18)) {
        await thisObject.weth.connect(owner).deposit({ value: nativeAmount })
        await thisObject.weth.connect(thisObject.alice).deposit({ value: nativeAmount })
    }
    // const balanceUsdc = await thisObject.usdc.balanceOf(thisObject.owner.address)
    // if (balanceUsdc < ethers.parseUnits("1000", 6)) {
    //     const router = thisObject.uniV2Router ? thisObject.uniV2Router : thisObject.pancakeswapRouter
    //     await router
    //         .connect(owner)
    //         .swapExactETHForTokens(1, [weth, usdc], thisObject.owner.address, Date.now() + 1000 * 60 * 10, { value: nativeAmount })
    // }
    const balanceUsdt = await thisObject.usdt.balanceOf(thisObject.owner.address)
    if (balanceUsdt < ethers.parseUnits("1000", 6)) {
        const router = thisObject.uniV2Router ? thisObject.uniV2Router : thisObject.pancakeswapRouter
        await router
            .connect(owner)
            .swapExactETHForTokens(1, [weth, usdt], thisObject.owner.address, Date.now() + 1000 * 60 * 10, { value: nativeAmount })
        await router
            .connect(thisObject.alice)
            .swapExactETHForTokens(1, [weth, usdt], thisObject.alice.address, Date.now() + 1000 * 60 * 10, { value: nativeAmount })

        await thisObject.usdt.connect(owner).approve(await router.getAddress(), MaxUint256)
        await thisObject.usdt.connect(thisObject.alice).approve(await router.getAddress(), MaxUint256)
    }
}

export async function prepareContractsTest({ thisObject }: { thisObject: Mocha.Context }) {
    console.log("Deploy:")
    const contracts = await deployHelper()
    const { universalFactory, universalWithdrawal, testToken, testTokenNoBool } = contracts.deployedContracts

    thisObject.universalFactory = universalFactory as BaseContract as UniversalFactory
    thisObject.universalWithdrawal = universalWithdrawal as BaseContract as UniversalWithdrawal
    thisObject.testToken = testToken as BaseContract as TestToken
    thisObject.testTokenNoBool = testTokenNoBool as BaseContract as TestTokenNoBool
}
