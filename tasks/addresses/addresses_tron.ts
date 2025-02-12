import { MockContractsAddress } from "./interfaces"

const WTRX = "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR"
const USDC_TRON = "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8"
const USDT_TRON = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"

const SunswapV2Router = "TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR"

function getMockAddresses_tron(owner: string): MockContractsAddress {
    return {
        owner,
        defies: [
            {
                addresses: [SunswapV2Router, SunswapV2Router],
            },
        ],
        tokens: {
            weth: WTRX,
            usdc: USDC_TRON,
            usdt: USDT_TRON,
        },
    }
}

export { getMockAddresses_tron, SunswapV2Router, USDC_TRON, USDT_TRON, WTRX }
