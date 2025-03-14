import fs from 'fs'

import { task } from 'hardhat/config'

// npx hardhat --network localhost_eth gen-abi
task('gen-abi').setAction(async (taskArgs, { artifacts, ethers }) => {
  const contracts: {
    contractName: string
  }[] = [
    { contractName: 'TronUniversalFactory' },
    { contractName: 'UniversalFactory' },
    { contractName: 'UniversalWithdrawal' },
    { contractName: 'UpgradeableProxy' },
    { contractName: 'Admin' },
    { contractName: 'LibAdmin' },
    { contractName: 'LibErrors' },
    { contractName: 'IEvents' },
    { contractName: 'TronClones' },
  ]

  interface Abi {
    name: string
    type: 'event' | 'function'
  }
  const abiEth: Abi[] = []

  for (const c of contracts) {
    const info = await artifacts.readArtifact(c.contractName)
    const { abi } = info

    // console.log(abiEth.length, abi.length)
    abi.forEach(elem => {
      if (!abiEth.some(elem2 => elem2.name === elem.name && elem2.type === elem.type)) {
        abiEth.push(elem)
      }
    })
    // console.log(abiEth.length, abi.length)
  }
  const abi = JSON.stringify(abiEth)
  fs.writeFileSync('build/Abi.json', abi)

  return abi
})
