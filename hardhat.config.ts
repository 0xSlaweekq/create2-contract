import '@nomicfoundation/hardhat-chai-matchers'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-ignition'
import '@nomicfoundation/hardhat-ignition-ethers'
import '@nomicfoundation/hardhat-network-helpers'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'
import '@openzeppelin/hardhat-upgrades'
import '@typechain/hardhat'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import './tasks'

import * as dotenv from 'dotenv'
import { HardhatUserConfig, task } from 'hardhat/config'
import { HardhatRuntimeEnvironment, MultiSolcUserConfig } from 'hardhat/types'
import path from 'path'

const envConfig = dotenv.config({ path: path.resolve('./', '.env') })

const {
  MNEMONIC,
  ETH_PRIVATE_KEY,
  BSC_PRIVATE_KEY,
  BSC_TESTNET_PRIVATE_KEY,
  SEPOLIA_PRIVATE_KEY,

  ETH_RPC_URL,
  BSC_RPC_URL,
  BSC_TESTNET_RPC_URL,
  SEPOLIA_RPC_URL,

  BSCSCAN_API_KEY,
  ETHERSCAN_API_KEY,
  NILE_API_KEY,

  NILE_RPC_URL,
  NILE_PRIVATE_KEY,

  PORT_ETH,
  FORKING_NETWORK_ID_ETH,

  PORT_BSC,
  FORKING_NETWORK_ID_BSC,

  PORT_TRON,
  FORKING_NETWORK_ID_TRON,
  PRIVATE_KEY_TEST_TRON,

  COINMARKETCAP_API_KEY,
  GAS_PRICE_API,
  REPORT_GAS,
  GAS_TOKEN,
} = envConfig.parsed || {}

const DEFAULT_COMPILER_SETTINGS: MultiSolcUserConfig = {
  compilers: [
    {
      version: '0.8.22',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
    {
      version: '0.8.9',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  ],
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: DEFAULT_COMPILER_SETTINGS,
  paths: {
    sources: './contracts',
    tests: './tests',
    artifacts: './build/artifacts',
    cache: './build/cache',
    deployments: './build/deployments',
  },
  networks: {
    // hardhat: {
    //     // ...defaultSettings,
    //     allowUnlimitedContractSize: true,
    //     forking: {
    //         enabled: true,
    //         url: process.env.FORKING_URL as string | "",
    //         blockNumber: 36800000,
    //     },
    //     accounts: { mnemonic: MNEMONIC },
    // },
    // tenderly: {
    //   chainId: 1,
    //   url: `https://rpc.tenderly.co/fork/${TENDERLY_API_KEY}`,
    //   accounts: {
    //     count: 10,
    //     balance: 100,
    //     mnemonic: MNEMONIC || str
    //   }
    // },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: [SEPOLIA_PRIVATE_KEY as string],
    },
    localhost_eth: {
      chainId: Number(FORKING_NETWORK_ID_ETH),
      url: `http://0.0.0.0:${PORT_ETH}`,
      // accounts: [`${PRIVATE_KEY1}`, `${PRIVATE_KEY2}`, `${PRIVATE_KEY3}`],
      accounts: { mnemonic: MNEMONIC },
    },
    localhost_bsc: {
      chainId: Number(FORKING_NETWORK_ID_BSC),
      url: `http://0.0.0.0:${PORT_BSC}`,
      accounts: { mnemonic: MNEMONIC },
    },
    bscTestnet: {
      url: BSC_TESTNET_RPC_URL,
      chainId: 97,
      accounts: [BSC_TESTNET_PRIVATE_KEY as string],
    },
    bscTestnet2: {
      url: BSC_TESTNET_RPC_URL,
      chainId: 97,
      accounts: { mnemonic: MNEMONIC as string },
    },
    tronTest: {
      url: `http://0.0.0.0:${PORT_TRON}`,
      chainId: Number(FORKING_NETWORK_ID_TRON),
      accounts: { mnemonic: MNEMONIC as string },
    },
    // ethereum: {
    //     url: ETH_RPC_URL,
    //     chainId: 1,
    //     accounts: [ETH_PRIVATE_KEY as string],
    // },
    // bsc: {
    //     url: BSC_RPC_URL,
    //     url: "https://bsc-dataseed.binance.org/",
    //     chainId: 56,
    //     accounts: [BSC_PRIVATE_KEY as string],
    // },
  },
  namedAccounts: {
    deployer: 0,
    admin: 1,
  },
  etherscan: {
    apiKey: {
      hardhat: ETHERSCAN_API_KEY || 'API_KEY_WEB',
      localhost_eth: ETHERSCAN_API_KEY || 'API_KEY_WEB',
      localhost: ETHERSCAN_API_KEY || 'API_KEY_WEB',
      ethereum: ETHERSCAN_API_KEY || 'API_KEY_WEB',
      sepolia: ETHERSCAN_API_KEY || 'API_KEY_WEB',
      bsc: BSCSCAN_API_KEY || 'API_KEY_WEB',
      bscTestnet: BSCSCAN_API_KEY || 'API_KEY_WEB',
      bscTestnet2: BSCSCAN_API_KEY || 'API_KEY_WEB',
      localhost_bsc: BSCSCAN_API_KEY || 'API_KEY_WEB',
      tronTest: NILE_API_KEY || 'API_KEY_WEB',
    },
  },
  abiExporter: {
    path: './build/abis',
    runOnCompile: true,
    clear: true,
    flat: false,
    only: [],
    spacing: 2,
    pretty: true,
  },
  typechain: {
    outDir: './build/typechain',
    target: 'ethers-v6',
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    outputFile: './build/contractSizer.md',
  },
  gasReporter: {
    enabled: Boolean(REPORT_GAS) === true,
    outputFile: './build/gas_usage.md',
    currency: 'USD',
    src: 'contracts',
    url: '', // URL будет установлено динамически
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: GAS_TOKEN || 'ETH',
    gasPriceApi: GAS_PRICE_API,
    showTimeSpent: true,
    maxMethodDiff: 10,
  },
  mocha: {
    timeout: 100000,
  },
}

task('test', 'Runs the test suite').setAction(async (args, hre: HardhatRuntimeEnvironment, runSuper) => {
  const selectedNetwork = hre.network.name

  // Проверяем, существует ли конфигурация для выбранной сети
  const networkConfig = hre.config.networks[selectedNetwork] as { url?: string }

  const hreConfig = hre.config as { gasReporter?: { url?: string; enabled?: boolean } }

  if (networkConfig?.url) {
    // Устанавливаем URL в конфигурацию gasReporter
    if (hreConfig.gasReporter) {
      if (selectedNetwork === 'tronTest') {
        hreConfig.gasReporter.enabled = false
      }

      hreConfig.gasReporter.url = networkConfig.url
    } else {
      console.warn(`Gas reporter is not enabled or not configured.`)
    }
  } else {
    console.warn(`No valid URL found for network: ${selectedNetwork}`)
  }

  console.log(`Gas Reporter URL set to: ${hreConfig.gasReporter?.url || 'Not set'}`)
  return runSuper(args) // Выполняем стандартное действие таски
})

export default config
