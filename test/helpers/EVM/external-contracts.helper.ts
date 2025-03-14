import { ethers } from 'hardhat'

import { WETH } from '../../../tasks/addresses'
import { getError } from '../../../utils/utils'
import { InputApproveToken, InputOneSwapUniV2, InputOneSwapUniV3, InputOneUnswapUniV2, InputOneUnswapUniV3 } from './interfaces.helper'

const deadline = Date.now() + 1000 * 60 * 10
export const _oneSwapUniV2 = async (input: InputOneSwapUniV2) => {
  const { token, usd, owner, router, ethAmt } = input
  const path = [await router.WETH(), token]
  const balanceBefore = await usd.balanceOf(owner)
  const answer = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(ethers.parseUnits('1', 6), path, owner, deadline, {
    from: owner,
    value: ethers.parseUnits(ethAmt.toString(), 'ether'),
  })
  const txn = await answer.wait()
  console.log('Swap eth to usdc/t. gas used: ', txn?.gasUsed)
  const balanceAfter = await usd.balanceOf(owner)
  return balanceAfter - balanceBefore
}

export const _oneUnswapUniV2 = async (input: InputOneUnswapUniV2) => {
  const { token, owner, router, balanceBefore, balanceAfter } = input
  const path = [token, await router.WETH()]
  const answer = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
    Number(balanceAfter) - Number(balanceBefore),
    0, // accept any amount of ETH
    path,
    owner,
    deadline,
  )
  const txn = await answer.wait()
  console.log('Swap Usdc/t to eth, gas used: ', txn?.gasUsed)
  return answer
}

export const _approveToken = async (input: InputApproveToken) => {
  const { token, owner, routerAddress } = input
  const approved = await token.allowance(owner.address, routerAddress)
  console.log('approve token. allowance: ', approved)

  const answer = await token.connect(owner).approve(routerAddress, ethers.parseUnits('10000000000', 6))
  const txn = await answer.wait()
  console.log('approve token. gas used: ', txn?.gasUsed)
  return txn
}

export const _oneSwapUniV3 = async (input: InputOneSwapUniV3) => {
  const { token, owner, router, fee, ethAmt } = input
  const params = {
    tokenIn: WETH,
    tokenOut: token,
    fee,
    recipient: owner,
    deadline,
    amountIn: ethers.parseUnits(ethAmt.toString(), 'ether'),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  }
  const answer = await router.exactInputSingle(params, {
    from: owner,
    value: ethers.parseUnits(ethAmt.toString(), 'ether'),
  })
  const txn = await answer.wait()
  console.log('Swap eth to usdc/t. gas used: ', txn?.gasUsed)
  return answer
}

export const _oneUnswapUniV3 = async (input: InputOneUnswapUniV3) => {
  const { tokenAddr, owner, router, fee, balanceBefore, balanceAfter } = input
  const amt = Number(balanceAfter - balanceBefore) / 1e6

  const params = {
    tokenIn: tokenAddr,
    tokenOut: WETH,
    fee,
    recipient: owner,
    deadline,
    amountIn: ethers.parseUnits(amt.toString(), 6),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  }
  try {
    const answer = await router.exactInputSingle(params)
    const txn = await answer.wait()
    console.log('Swap Usdc/t to eth, gas used: ', txn?.gasUsed)
  } catch (e) {
    await getError({ e })
  }
}
