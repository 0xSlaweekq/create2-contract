import { BigNumberish, Contract, ContractFactory, parseUnits } from "ethers"
import { task } from "hardhat/config"

import { PancakeBSCRouter, UniswapV2Router, USDC, USDC_BSC, USDT, USDT_BSC, WBNB, WETH } from "../addresses"

// npx hardhat --network localhost_eth mint-usdc --user 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --chain eth
// npx hardhat --network localhost_bsc mint-usdc --user 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --chain bsc
task("mint-usdc")
    .addParam("user") // address
    .addParam("chain") // chain
    .setAction(async (taskArgs, hre) => {
        const signer = await hre.run("account")

        let erc20: Contract | any
        let uniswapV2Router: Contract | any
        let countTokens
        let usdcAmountOut: BigNumberish

        const erc20Factory = await hre.ethers.getContractFactory("MockToken")
        const uniswapV2RouterFactory: ContractFactory = await hre.ethers.getContractFactory("MockUniswapV2Router")

        if (taskArgs.chain === "eth") {
            erc20 = erc20Factory.attach(USDC)
            uniswapV2Router = uniswapV2RouterFactory.attach(UniswapV2Router)

            usdcAmountOut = parseUnits("100000", 6)
            countTokens = await uniswapV2Router.getAmountsIn(usdcAmountOut, [WETH, USDC])
            await uniswapV2Router
                .connect(signer)
                .swapETHForExactTokens(usdcAmountOut, [WETH, USDC], taskArgs.user, Date.now() + 1000 * 60 * 10, {
                    value: countTokens[0],
                    maxFeePerGas: parseUnits("21000", "gwei"),
                    maxPriorityFeePerGas: parseUnits("21000", "gwei"),
                })
        } else {
            erc20 = erc20Factory.attach(USDC_BSC)
            uniswapV2Router = uniswapV2RouterFactory.attach(PancakeBSCRouter)

            usdcAmountOut = parseUnits("50000", 18)
            countTokens = await uniswapV2Router.getAmountsIn(usdcAmountOut, [WBNB, USDC_BSC])
            await uniswapV2Router
                .connect(signer)
                .swapETHForExactTokens(usdcAmountOut, [WBNB, USDC_BSC], taskArgs.user, Date.now() + 1000 * 60 * 10, {
                    value: countTokens[0],
                    maxFeePerGas: parseUnits("21000", "gwei"),
                    maxPriorityFeePerGas: parseUnits("21000", "gwei"),
                })
        }

        console.log("Balance usdc for user: ", await erc20.balanceOf(taskArgs.user))
    })

// npx hardhat --network localhost_eth mint-usdt --user 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --chain eth
// npx hardhat --network localhost_bsc mint-usdt --user 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --chain bsc
task("mint-usdt")
    .addParam("user") // id токена
    .addParam("chain") // chain
    .setAction(async (taskArgs, hre) => {
        const signer = await hre.run("account")

        let erc20: Contract | any
        let uniswapV2Router: Contract | any
        let countTokens
        let usdtAmountOut: BigNumberish

        const erc20Factory = await hre.ethers.getContractFactory("MockToken")
        const uniswapV2RouterFactory: ContractFactory = await hre.ethers.getContractFactory("MockUniswapV2Router")

        if (taskArgs.chain === "eth") {
            erc20 = erc20Factory.attach(USDT)
            uniswapV2Router = uniswapV2RouterFactory.attach(UniswapV2Router)

            usdtAmountOut = parseUnits("100000", 6)
            countTokens = await uniswapV2Router.getAmountsIn(usdtAmountOut, [WETH, USDT])
            await uniswapV2Router
                .connect(signer)
                .swapETHForExactTokens(usdtAmountOut, [WETH, USDT], taskArgs.user, Date.now() + 1000 * 60 * 10, {
                    value: countTokens[0],
                    maxFeePerGas: parseUnits("21000", "gwei"),
                    maxPriorityFeePerGas: parseUnits("21000", "gwei"),
                })
        } else {
            erc20 = erc20Factory.attach(USDT_BSC)
            uniswapV2Router = uniswapV2RouterFactory.attach(PancakeBSCRouter)

            usdtAmountOut = parseUnits("100000", 18)
            countTokens = await uniswapV2Router.getAmountsIn(usdtAmountOut, [WBNB, USDT_BSC])
            await uniswapV2Router
                .connect(signer)
                .swapETHForExactTokens(usdtAmountOut, [WBNB, USDT_BSC], taskArgs.user, Date.now() + 1000 * 60 * 10, {
                    value: countTokens[0],
                    maxFeePerGas: parseUnits("21000", "gwei"),
                    maxPriorityFeePerGas: parseUnits("21000", "gwei"),
                })
        }

        console.log("Balance usdt for user: ", await erc20.balanceOf(taskArgs.user))
    })
