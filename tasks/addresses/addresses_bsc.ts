import { MockContractsAddress } from "./interfaces"

const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955"
const USDC_BSC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"

const PancakeBSCRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"

function getMockAddresses_bsc(owner: string): MockContractsAddress {
    return {
        owner,
        defies: [
            {
                addresses: [PancakeBSCRouter, PancakeBSCRouter],
            },
        ],
        tokens: {
            weth: WBNB,
            usdc: USDC_BSC,
            usdt: USDT_BSC,
        },
    }
}

export { getMockAddresses_bsc, PancakeBSCRouter, USDC_BSC, USDT_BSC, WBNB }
