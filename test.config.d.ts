import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import {
    MockNonfungiblePositionManager,
    MockSwapRouter,
    MockToken,
    MockUniswapV2Router,
    MockWETH,
    TestToken,
    TestTokenNoBool,
    UniversalFactory,
    UniversalWithdrawal,
} from "build/typechain"
import { Contract } from "tronweb"

declare module "mocha" {
    export interface Context {
        signers: SignerWithAddress[]
        owner: SignerWithAddress
        alice: SignerWithAddress
        bob: SignerWithAddress
        jane: SignerWithAddress

        weth: MockWETH
        wbnb: MockWETH
        usdt: MockToken
        usdc: MockToken

        testToken: TestToken
        testTokenNoBool: TestTokenNoBool

        pancakeswapRouter: MockUniswapV2Router
        uniV2Router: MockUniswapV2Router
        uniV3Router: MockSwapRouter
        uniV3PositionManager: MockNonfungiblePositionManager

        universalFactory: UniversalFactory
        universalWithdrawal: UniversalWithdrawal

        tronUrl: string
        tronDefaultFactory: Contract
        tronUniversalWithdrawal: Contract
        tronUniversalFactory: Contract
        tronTestToken: Contract
        tronTestTokenNoBool: Contract

        tronWTRX: Contract
        tronUSDC: Contract
        tronUSDT: Contract
        tronSunSwap: Contract
    }
}

declare module "@openzeppelin/test-helpers"
declare module "solidity-coverage"
