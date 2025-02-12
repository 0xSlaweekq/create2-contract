export interface MockContractsAddress {
    owner: string
    defies: Defies[]
    tokens: {
        weth: string
        usdt: string
        usdc: string
    }
}
export interface Defies {
    addresses: string[] // liquidityAddress, routerAddress, reserveAddress
}
