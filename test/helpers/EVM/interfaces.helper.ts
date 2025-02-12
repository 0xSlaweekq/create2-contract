import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { MockSwapRouter, MockToken, MockUniswapV2Router } from "build/typechain"

interface InputApproveToken {
    token: MockToken
    owner: SignerWithAddress
    routerAddress: string
}
interface InputOneSwapUniV2 {
    token: string
    usd: MockToken
    owner: string
    router: MockUniswapV2Router
    ethAmt: number
}
interface InputOneSwapUniV3 {
    token: string
    owner: string
    router: MockSwapRouter
    fee: number
    ethAmt: number
}
interface InputOneUnswapUniV2 {
    token: string
    owner: string
    router: MockUniswapV2Router
    balanceBefore: bigint
    balanceAfter: bigint
}
interface InputOneUnswapUniV3 {
    tokenAddr: string
    owner: string
    router: MockSwapRouter
    fee: number
    balanceBefore: bigint
    balanceAfter: bigint
}
export type { InputApproveToken, InputOneSwapUniV2, InputOneSwapUniV3, InputOneUnswapUniV2, InputOneUnswapUniV3 }
