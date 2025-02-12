import { randomUUID } from "crypto"
import { config } from "dotenv"
import fs from "fs"
import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { resolve } from "path"
import { Contract, TronWeb } from "tronweb"

config()

const defaultPath = "../tronbox/build"
const factoryPath = `${defaultPath}/TronUniversalFactory.json`
const withdrawalPath = `${defaultPath}/UniversalWithdrawal.json`
const testTokenPath = `${defaultPath}/TestToken.json`
const testTokenNoBoolPath = `${defaultPath}/TestTokenNoBool.json`

const wtrxPath = `${defaultPath}/MockWETH.json`
const tokenPath = `${defaultPath}/MockToken.json`
const routerPath = `${defaultPath}/MockUniswapV2Router.json`

const conf = {
    feeLimit: 1_000_000_000, // Set the fee limit
    callValue: 0, // Set the call value to 0
}

// Initialize TronWeb
let tronWeb: TronWeb

const tronWebNile = new TronWeb({
    fullHost: process.env.NILE_RPC_URL as string,
    privateKey: process.env.NILE_PRIVATE_KEY as string,
})
const tronWebTest = new TronWeb({
    fullHost: `http://0.0.0.0:${process.env.PORT_TRON}`,
    privateKey: process.env.PRIVATE_KEY_TEST_TRON as string,
})

// npx hardhat deploy:tron_universal_withdrawal --net nile
// npx hardhat deploy:tron_universal_withdrawal --net tronTest
task("deploy:tron_universal_withdrawal", "Deploys the TronUniversalWithdrawal contract")
    .addOptionalParam("net")
    .setAction(async ({ net = "tronTest" }, hre: HardhatRuntimeEnvironment) => {
        const { abi: wabi, bytecode: wbytecode } = JSON.parse(fs.readFileSync(resolve(__dirname, withdrawalPath)).toString())

        if (net === "nile") {
            tronWeb = tronWebNile
        } else {
            tronWeb = tronWebTest
        }

        const contractWithdrawal = await tronWeb.contract().new({
            abi: wabi,
            bytecode: wbytecode,
            ...conf,
        })
        const contractWithdrawalAddress = contractWithdrawal.address as string
        console.log("UniversalWithdrawal deployed to", tronWeb.address.fromHex(contractWithdrawalAddress))

        return { contractWithdrawal, contractWithdrawalAddress }
    })

// withdrawal - the address of the UniversalWithdrawal contract, necessary for initializing the UniversalFactory and admin panel and storage
// npx hardhat deploy:tron_universal_factory --net nile --withdrawal
// npx hardhat deploy:tron_universal_factory --net tronTest --withdrawal
task("deploy:tron_universal_factory", "Deploys the TronUniversalFactory contract")
    .addOptionalParam("net")
    .addOptionalParam("withdrawal")
    .setAction(async ({ net = "tronTest", withdrawal }, hre: HardhatRuntimeEnvironment) => {
        const { ethers, run } = hre

        const { abi: wabi } = JSON.parse(fs.readFileSync(resolve(__dirname, withdrawalPath)).toString())
        const { abi: fabi, bytecode: fbytecode } = JSON.parse(fs.readFileSync(resolve(__dirname, factoryPath)).toString())

        if (net === "nile") {
            tronWeb = tronWebNile
        } else {
            tronWeb = tronWebTest
        }
        let contractWithdrawal: Contract
        let contractWithdrawalAddress: string

        if (!withdrawal) {
            const withdraw = await run("deploy:tron_universal_withdrawal", { net })
            contractWithdrawal = withdraw.contractWithdrawal
            contractWithdrawalAddress = withdraw.contractWithdrawalAddress
        } else {
            contractWithdrawal = tronWeb.contract(wabi, withdrawal)
            contractWithdrawalAddress = withdrawal
        }

        const contractFactory = await tronWeb.contract().new({
            abi: fabi,
            bytecode: fbytecode,
            parameters: [contractWithdrawalAddress],
            ...conf,
        })
        const contractFactoryAddress = contractFactory.address as string
        console.log("TronUniversalFactory deployed to", tronWeb.address.fromHex(contractFactoryAddress))

        return { contractWithdrawal, contractWithdrawalAddress, contractFactory, contractFactoryAddress }
    })

// npx hardhat deploy:tron_test_token --net nile
// npx hardhat deploy:tron_test_token --net tronTest
task("deploy:tron_test_token", "Deploys the TronUniversalWithdrawal contract")
    .addOptionalParam("net")
    .setAction(async ({ net = "tronTest" }, hre: HardhatRuntimeEnvironment) => {
        const { abi: tabi, bytecode: tbytecode } = JSON.parse(fs.readFileSync(resolve(__dirname, testTokenPath)).toString())

        if (net === "nile") {
            tronWeb = tronWebNile
        } else {
            tronWeb = tronWebTest
        }

        const testToken = await tronWeb.contract().new({
            abi: tabi,
            bytecode: tbytecode,
            ...conf,
        })
        const testTokenAddress = testToken.address as string
        console.log("UniversalWithdrawal deployed to", tronWeb.address.fromHex(testTokenAddress))

        return { testToken, testTokenAddress }
    })

// npx hardhat deploy:tron_test_token_no_bool --net nile
// npx hardhat deploy:tron_test_token_no_bool --net tronTest
task("deploy:tron_test_token_no_bool", "Deploys the TronUniversalWithdrawal contract")
    .addOptionalParam("net")
    .setAction(async ({ net = "tronTest" }, hre: HardhatRuntimeEnvironment) => {
        const { abi: tnabi, bytecode: tnbytecode } = JSON.parse(fs.readFileSync(resolve(__dirname, testTokenNoBoolPath)).toString())

        if (net === "nile") {
            tronWeb = tronWebNile
        } else {
            tronWeb = tronWebTest
        }

        const testTokenNoBool = await tronWeb.contract().new({
            abi: tnabi,
            bytecode: tnbytecode,
            ...conf,
        })
        const testTokenNoBoolAddress = testTokenNoBool.address as string
        console.log("UniversalWithdrawal deployed to", tronWeb.address.fromHex(testTokenNoBoolAddress))

        return { testTokenNoBool, testTokenNoBoolAddress }
    })

// factory - the address of the UniversalFactory contract
// npx hardhat deploy:proxy --net nile --factory
// npx hardhat deploy:proxy --net tronTest --factory
task("deploy:proxy", "Deploys the UpgradeableProxy contract")
    .addOptionalParam("net")
    .addOptionalParam("factory")
    .setAction(async ({ net = "tronTest", factory }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre
        const { abi: fabi, bytecode: fbytecode } = JSON.parse(fs.readFileSync(resolve(__dirname, factoryPath)).toString())

        if (net === "nile") {
            tronWeb = tronWebNile
        } else {
            tronWeb = tronWebTest
        }

        const contractFactory = await tronWeb.contract(fabi, factory)

        const salt = ethers.id(randomUUID())
        const predictAddress = await contractFactory.predictAddress(salt).call()
        await contractFactory.createClone(salt).send()

        console.log("UpgradeableProxy deployed to", tronWeb.address.fromHex(predictAddress.predictedAddress))

        return { predictAddress: predictAddress.predictedAddress }
    })
