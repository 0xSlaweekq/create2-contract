import * as bip39 from "bip39"
import hdkey from "hdkey"
import { TronWeb } from "tronweb"

interface GenerateTronAddressesFromMnemonic {
    mnemonic: string
    n?: number
    skip?: number
}

interface Accounts {
    b58: string[]
    hex: string[]
    pks: string[]
}

async function generateTronAddressesFromMnemonic({ mnemonic, n = 10, skip = 0 }: GenerateTronAddressesFromMnemonic) {
    const tronWeb = new TronWeb({
        fullHost: "https://nile.trongrid.io", // Tron full node API endpoint
    })

    const seed = await bip39.mnemonicToSeed(mnemonic)
    const root = hdkey.fromMasterSeed(seed)
    const masterKey = root.derive("m/44'/195'/0'/0")

    const privateKeys: string[] = []
    const addresses: string[] = []

    for (let i = skip; i < skip + n; ++i) {
        const addressNode = masterKey.deriveChild(i)
        const privateKeyBuffer = addressNode.privateKey as Buffer
        const privateKey = privateKeyBuffer.toString("hex")

        const address = tronWeb.address.fromPrivateKey(privateKey) as string
        privateKeys.push(privateKey)
        addresses.push(address)
        console.log(`Address ${i + 1}: ${address}, privateKey: ${privateKey}`)
    }

    return { privateKeys, addresses }
}

async function getTestAccounts(tronUrl: string) {
    const tronWeb = new TronWeb({
        fullHost: tronUrl,
    })
    const accounts: Accounts = {
        b58: [],
        hex: [],
        pks: [],
    }
    const accountsJson: any = await tronWeb.fullNode.request("/admin/accounts-json")
    accounts.pks = accountsJson.privateKeys
    for (let i = 0; i < accounts.pks.length; ++i) {
        const addr = tronWeb.address.fromPrivateKey(accounts.pks[i]) as string

        accounts.b58.push(addr)
        accounts.hex.push(tronWeb.address.toHex(addr))
    }
    return accounts
}

export { generateTronAddressesFromMnemonic, getTestAccounts }
