import { task } from 'hardhat/config'

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

task('check-node', '.', async (taskArgs, hre) => {
  await timeout(10000)
  let maxNumberOfCalls = 6
  let isReadyNode = false
  while (maxNumberOfCalls !== 0 && !isReadyNode) {
    try {
      await hre.ethers.provider.getBlock('latest')
      isReadyNode = true
    } catch (error) {
      maxNumberOfCalls--
      console.log(`node is not ready, ${hre.network.name}`)
      console.log(`wait node ${hre.network.name}`)
      await timeout(10000)
      // console.log(error);
    }
  }
  if (!isReadyNode) {
    throw new Error(`node is not ready, ${hre.network.name}`)
  }
})

function timeout(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
