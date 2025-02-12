import { MockContractsAddress } from "./interfaces"

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"

const UniswapV2Router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const UniswapV3PositionManager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
const UniswapV3Router = "0xE592427A0AEce92De3Edee1F18E0157C05861564"

function getMockAddresses_eth(owner: string): MockContractsAddress {
    return {
        owner,
        defies: [
            {
                addresses: [UniswapV2Router, UniswapV2Router],
            },
            {
                addresses: [UniswapV3PositionManager, UniswapV3Router],
            },
        ],
        tokens: {
            weth: WETH,
            usdc: USDC,
            usdt: USDT,
        },
    }
}

export { DAI, getMockAddresses_eth, UniswapV2Router, UniswapV3PositionManager, UniswapV3Router, USDC, USDT, WETH }
