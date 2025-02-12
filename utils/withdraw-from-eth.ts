import { config } from "dotenv"
import hre from "hardhat"

import abi from "../build/abis/contracts/old/common/DefaultWithdrawal.sol/DefaultWithdrawal.json"

config()

async function main(): Promise<void> {
    const { ethers } = hre
    const { JsonRpcProvider, parseUnits } = ethers
    try {
        // eth
        const contractAddress = "0xcba6a50bc42bf4817599ec0d0dd7795d1a969591"
        const toAddress = "0x98a493408b51Ba59421Da71944034fB6abF9ABF5"
        const erc20Address = "0xeb463b160f3eca721f9ffb5a5cb7e2c15fb0b6f6"
        const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
        const privateKey = process.env.SEPOLIA_PRIVATE_KEY as string

        // bsc
        // const contractAddress = "0x59be4B8BB9B2728EcC438d6D1036233861585DDd";
        // const toAddress = "0x84Dfd24E3f33BCAbB36a3f11519cC105f60F1861";
        // const erc20Address = "0xCeE15E9F347134dcE529Df71c8443d71B2022B25";
        // const provider = new ethers.providers.JsonRpcProvider(
        //   process.env.BSC_TESTNET_RPC_URL
        // );
        // const privateKey = process.env.BSC_TESTNET_PRIVATE_KEY;
        const signer = new ethers.Wallet(privateKey, provider)

        // Create a contract instance
        const contract = new ethers.Contract(contractAddress, abi, signer)

        // Call the withdraw ETH method
        const amtToSend = parseUnits("1", 0)
        // const ethTx = await contract.withdraw(amtToSend, toAddress);
        // console.log(await ethTx.wait());

        // Call the withdraw ERC20 method
        const erc20Tx = await contract.withdrawERC20(erc20Address, amtToSend, toAddress)
        console.log("ERC20 Transaction:", erc20Tx)
        console.log("Transaction Receipt:", await erc20Tx.wait())
        process.exit(0)
    } catch (error) {
        console.error("Error executing script:", error)
        process.exit(1)
    }
}

main()
