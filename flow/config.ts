export enum Blockchain {
  ETH = 'ETH',
  BSC = 'BSC',
  TRX = 'TRX',
}
export enum Network {
  MAINNET = 'MAINNET',
  SEPOLIA = 'SEPOLIA',
  BSC_TESTNET = 'BSC_TESTNET',
  NILE = 'NILE',
}

export type TokenType = {
  address: string
  native?: boolean
}

// export enum FactoryTypes {
//     DefaultFactory = 'DefaultFactory',
//     NoSafeTransferFactory = 'NoSafeTransferFactory',
//     TronDefaultFactory = 'TronDefaultFactory',
//     TronNoSafeNoRequireFactory = 'TronNoSafeNoRequireFactory'
// }

export type configType = {
  [blockchain in Blockchain]?: {
    [network in Network]?: {
      rpcUrl: string
      privateKey: string
      tokens: {
        [token: string]: TokenType
      }
    }
  }
}
export const tokensConfig: configType = {
  ETH: {
    MAINNET: {
      rpcUrl: process.env.ETH_RPC_URL!,
      privateKey: process.env.ETH_PRIVATE_KEY!,
      // токен взять с chatmio-exchange
      tokens: {
        ETH: {
          address: '',
          native: true,
        },
        EURT: {
          address: '0xc581b735a1688071a1746c968e0798d642ede491',
        },
        USDT: {
          address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
        CNHT: {
          address: '0x6e109e9dd7fa1a58bc3eff667e8e41fc3cc07aef',
        },
        XAUT: {
          address: '0x68749665FF8D2d112Fa859AA293F07A622782F38',
        },
        USDCETH: {
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
        SHIBETH: {
          address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
        },
        MATCETH: {
          address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
        },
        CROETH: {
          address: '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b',
        },
        LINKETH: {
          address: '0x514910771af9ca656af840dff83e8264ecf986ca',
        },
        WBTCETH: {
          address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        },
        BUSDETH: {
          address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
        },
      },
    },
    SEPOLIA: {
      rpcUrl: process.env.SEPOLIA_RPC_URL!,
      privateKey: process.env.SEPOLIA_PRIVATE_KEY!,
      tokens: {
        ETH: {
          address: '',
          native: true,
        },
        EURT: {
          address: '0x81dd5d2429b782588b255876a91a1096cec9bfd7',
        },
        USDT: {
          address: '0x239d2c5c552bdca54f021800f22eee4dd46e77c5',
        },
        CNHT: {
          address: '0xeb463b160f3eca721f9ffb5a5cb7e2c15fb0b6f6',
        },
        XAUT: {
          address: '0xb2f3283620ad0006f5abc21959ddc55dd596ac30',
        },
        USDCETH: {
          address: '0x99ca9faa461be470dcff54d5b2e5857ef253aeb8',
        },
        SHIBETH: {
          address: '0x861ab815bef65e75d97065cb7263932435268efe',
        },
        MATCETH: {
          address: '0x156ba8decfba15b83a4e84b84d75896abc251b26',
        },
        CROETH: {
          address: '0xf94896618c1a131e629576a5270f1d4469f68708',
        },
        LINKETH: {
          address: '0x6c6cae990d3995121b05c1072cf077a34749b13e',
        },
        WBTCETH: {
          address: '0x94fa72189fedc8a1e1a981f5ec1b24dae5360be7',
        },
        BUSDETH: {
          address: '0x0ef71fd8ae1f98f59f5cfcb3957944691b7cb52c',
        },
      },
    },
  },
  BSC: {
    MAINNET: {
      rpcUrl: process.env.BSC_RPC_URL!,
      privateKey: process.env.BNB_PRIVATE_KEY!,
      tokens: {
        BNB: {
          address: '',
          native: true,
        },
        BUSDBSC: {
          address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        },
        USDTBSC: {
          address: '0x55d398326f99059ff775485246999027b3197955',
        },
        CORNBNB: {
          address: '0x3AF6F4fA0D451C170dDeE3c79bAa8DC37DF322C5',
        },
      },
    },
    BSC_TESTNET: {
      rpcUrl: process.env.BSC_TESTNET_RPC_URL!,
      privateKey: process.env.BSC_TESTNET_PRIVATE_KEY!,
      tokens: {
        BNB: {
          address: '',
          native: true,
        },
        BUSDBSC: {
          address: '0xCeE15E9F347134dcE529Df71c8443d71B2022B25',
        },
        USDTBSC: {
          address: '0x29bAcB3F96E0dd00e59005F2E6e4714EC4C84BE3',
        },
        CORNBNB: {
          address: '0xceb8987b6f99f36156c85f1e23eea0b8e776c1bb',
        },
      },
    },
  },
  TRX: {
    MAINNET: {
      rpcUrl: process.env.TRON_RPC_URL!,
      privateKey: process.env.TRON_PRIVATE_KEY!,
      tokens: {
        TRX: {
          address: '',
          native: true,
        },
        USDTTRX: {
          address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        },
        USDCTRX: {
          address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
        },
      },
    },
    NILE: {
      rpcUrl: process.env.NILE_RPC_URL!,
      privateKey: process.env.NILE_PRIVATE_KEY!,
      tokens: {
        TRX: {
          address: '',
          native: true,
        },
        USDTTRX: {
          address: 'TUQGsivyFXP4D6VSbFYy9nc9T4LJ3k3vVk',
        },
        USDCTRX: {
          address: 'TSJF93pX7Y54wzcGLiXevaU3BvMnDCPJaL',
        },
      },
    },
  },
}
