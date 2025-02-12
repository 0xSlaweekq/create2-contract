import { randomUUID } from "node:crypto"

import { Interface } from "ethers"
import { subtask, task, types } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const mainAccount = 0 // account id
export const localNetworks = ["localhost", "localhost_eth", "localhost_bsc", "bscTestnet2"]

subtask("account", "Get account")
    .addOptionalParam("id")
    .setAction(async ({ id }, hre) => {
        const accounts = await hre.ethers.getSigners()
        let account
        if (id && id >= 0 && id <= 20) {
            account = accounts[id]
        } else {
            account = accounts[mainAccount]
        }
        return account
    })

subtask("events", "Get events of txn")
    .addParam(
        "txn",
        "TXN transaction",
        [], // default value
        types.json,
    )
    .setAction(async ({ txn }) => {
        const answer = []
        console.log(`Txn Hash: ${txn.hash}`)
        const resultTxn = await txn.wait()
        if (resultTxn.events !== undefined) {
            for (const event of resultTxn.events) {
                console.log(`Event "${event.event}" with args [${event.args}]`)
                answer.push([event.event, event.args])
            }
        }
        return answer
    })

subtask("interface")
    .addParam("contractName", "ContractName")
    .setAction(async ({ contractName }, hre) => {
        const facetAddress = await hre.run("gca", { contractName })

        const jsonFacet = (await hre.ethers.getContractAt(contractName, facetAddress)).interface.format()
        return new Interface([...jsonFacet])
    })

task("id", "Get id for clone").setAction(async ({ _ }, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre

    console.log(ethers.id(randomUUID()))
})
