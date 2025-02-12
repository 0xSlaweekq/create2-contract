import { ethers } from "hardhat"
import { Contract, TronWeb } from "tronweb"

import { getTestAccounts } from "../../../utils/generate-tron-addresses"
import { deployHelperTron } from "./deploy.helper"

export async function prepareSignersTron({ thisObject, tronUrl }: { thisObject: Mocha.Context; tronUrl: string }) {
    const accounts = await getTestAccounts(tronUrl)

    const signers: TronWeb[] = []
    for (const p of accounts.pks) {
        signers.push(
            new TronWeb({
                fullHost: tronUrl,
                privateKey: p,
            }),
        )
    }
    thisObject.tronUrl = tronUrl

    thisObject.signers = signers

    thisObject.owner = thisObject.signers[0]
    thisObject.alice = thisObject.signers[1]
    thisObject.bob = thisObject.signers[2]
    thisObject.jane = thisObject.signers[4]
}

export async function prepareContractsTron(thisObject: Mocha.Context) {
    console.log("Deploy Tron:")
    const contracts = await deployHelperTron(thisObject.signers)

    if (!contracts.mockContracts) {
        throw Error("need mock mode!")
    }
    const { weth, usdc, usdt } = contracts.mockContracts.tokens

    const {
        _tronWTRX,
        // _tronUSDC,
        // _tronUSDT,
        // _tronSunSwap,
        _tronUniversalWithdrawal,
        _universalFactory,
        _testToken,
        _testTokenNoBool,
    } = contracts.deployedContracts

    thisObject.tronUniversalWithdrawal = _tronUniversalWithdrawal as Contract
    thisObject.tronUniversalFactory = _universalFactory as Contract
    thisObject.tronTestToken = _testToken as Contract
    thisObject.tronTestTokenNoBool = _testTokenNoBool as Contract

    thisObject.tronWTRX = _tronWTRX as Contract
    // thisObject.tronUSDC = _tronUSDC as Contract
    // thisObject.tronUSDT = _tronUSDT as Contract
    // thisObject.tronSunSwap = _tronSunSwap as Contract

    const { owner, alice, bob, jane } = thisObject

    // getting usdc and usdt
    const nativeAmount = ethers.parseUnits("10000", 18)

    await _testToken.transferMany([alice.defaultAddress.base58, bob.defaultAddress.base58, jane.defaultAddress.base58], nativeAmount).send()
    await _testTokenNoBool
        .transferMany([alice.defaultAddress.base58, bob.defaultAddress.base58, jane.defaultAddress.base58], nativeAmount)
        .send()
}
