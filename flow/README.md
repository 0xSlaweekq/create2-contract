# Flow

### Before all: deploy fabrics and clones

Check [readme.md](../README.md)

### Send funds manually to fabric address

### Withdraw from fabric

ts-node .\flow\withdraw.ts <blockchain> <network> <token> <cloneAddress>
<amountSatoshis> <recipientAddress>

example

```bash
ts-node ./flow/withdraw.ts ETH SEPOLIA ETH 0xd6DE87c780d9Fdb3A3e09B60ed890744b25F4a18 1 0x84Dfd24E3f33BCAbB36a3f11519cC105f60F1861
ts-node ./flow/withdraw.ts ETH SEPOLIA USDT 0xd6DE87c780d9Fdb3A3e09B60ed890744b25F4a18 1 0x84Dfd24E3f33BCAbB36a3f11519cC105f60F1861

ts-node ./flow/withdraw.ts BSC BSC_TESTNET BUSDBSC 0xfDa34d6cd2144B627931e89151C69a8E1F50023d 1 0x84Dfd24E3f33BCAbB36a3f11519cC105f60F1861
ts-node ./flow/withdraw.ts BSC BSC_TESTNET BNB 0xfDa34d6cd2144B627931e89151C69a8E1F50023d 1 0x84Dfd24E3f33BCAbB36a3f11519cC105f60F1861

ts-node ./flow/withdraw.ts TRX NILE USDTTRX TSwqLMJHVZXGBGndrRj4hJoR5iXy4Xmnhe 1 TMbSNPQTfUMLaeaot4VEXZPX4F3N5miJ2s
ts-node ./flow/withdraw.ts TRX NILE USDTTRX TVJ72it6YpSEDy6nMAMwryVKqCFMpwUGTt 1 TMbSNPQTfUMLaeaot4VEXZPX4F3N5miJ2s

ts-node ./flow/withdraw.ts TRX NILE TRX TSwqLMJHVZXGBGndrRj4hJoR5iXy4Xmnhe 1 TMbSNPQTfUMLaeaot4VEXZPX4F3N5miJ2s
ts-node ./flow/withdraw.ts TRX NILE TRX TVJ72it6YpSEDy6nMAMwryVKqCFMpwUGTt 1 TMbSNPQTfUMLaeaot4VEXZPX4F3N5miJ2s
```

#### Blockchains

- ETH
- BSC
- TRX

#### Networks

- MAINNET
- SEPOLIA
- BSC_TESTNET
- NILE

#### Tokens

same as tezro eos tokens

### Contracts

## Sepolia

- Owner: **0b8920a974e79442056ed09c00bb2e2894d86154e85e062ae31bb1506c16d657**

Factories

- Default Factory: **0xB15DbA97774dd0b022fCA1a8B01c650616370e31**
- NoSafeTransfer Factory: **0x69a33098077cD532085490c8af1A00a4d981358f**

Clones

- Default Factory Clone with salt "1":
  **0x570A43A6Da405fAB53564cdD3324acAFb385BC4C**
- NoSafeTransfer Factory Clone with salt "1":
  **0xd6DE87c780d9Fdb3A3e09B60ed890744b25F4a18**

## BnbTestnet

- Owner: **0b8920a974e79442056ed09c00bb2e2894d86154e85e062ae31bb1506c16d657**

Factories

- Default Factory: **0x7e1810f67D7Dca45393f5b8Fc6d0D5879Edf80a3**

Clones

- Default Factory Clone with salt "1":
  **0xfDa34d6cd2144B627931e89151C69a8E1F50023d**

## Nile

- Owner: **f7b12df51035175a2a8f5448c8c5677aef53b459fde4ede6cf1a6c9f8377224a**

Factories

- Default Factory: **TLw1ryVrLAmAY9UZxm2moGSKPezJYuhths**
- NoSafeNoRequire Factory: **TX3zUVHqYRDDgmUrxWy5vUJwPgkDDhTKmJ**

Clones

- Default Factory Clone with salt "1": **TVJ72it6YpSEDy6nMAMwryVKqCFMpwUGTt**
- NoSafeNoRequire Factory Clone with salt "1":
  **TSwqLMJHVZXGBGndrRj4hJoR5iXy4Xmnhe**
