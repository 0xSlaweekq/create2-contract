// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title MockSwapRouter
 * @dev A mock implementation of Uniswap V router.
 * @author Publius
 */
contract MockSwapRouter {
  /**
   * @dev Struct representing the parameters for a single token swap.
   * @param tokenIn The address of the input token to be swapped.
   * @param tokenOut The address of the output token to receive.
   * @param fee A 24-bit unsigned integer representing the fee for the swap.
   * @param recipient The address of the recipient who will receive the swapped tokens.
   * @param deadline A timestamp indicating the deadline by which the swap must be executed.
   * @param amountIn The amount of the input token to be swapped.
   * @param amountOutMinimum The minimum amount of the output token to receive.
   * @param sqrtPriceLimitX96 A 160-bit unsigned integer representing the square
   *        root of the price limit for the swap.
   */
  struct ExactInputSingleParams {
    address tokenIn;
    address tokenOut;
    uint24 fee;
    address recipient;
    uint256 deadline;
    uint256 amountIn;
    uint256 amountOutMinimum;
    uint160 sqrtPriceLimitX96;
  }

  /**
   * @dev Struct representing the parameters for a token swap.
   * @param path The path of tokens to swap. Expressed as a sequence of token addresses.
   * @param recipient The address of the recipient who will receive the swapped tokens.
   * @param deadline The deadline by which the swap must be executed.
   * @param amountIn The amount of the input token to swap.
   * @param amountOutMinimum The minimum amount of the output token to receive.
   */
  struct ExactInputParams {
    bytes path;
    address recipient;
    uint256 deadline;
    uint256 amountIn;
    uint256 amountOutMinimum;
  }

  /**
   * @dev Swaps `amountIn` of one token for as much as possible of another token.
   * @param params The parameters necessary for the swap, encoded
   *        as ExactInputSingleParams in calldata.
   * @return amountOut The amount of the received token.
   */
  function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut) {}

  /**
   * @dev Swaps `amountIn` of one token for as much as possible of another
   *      along the specified path.
   * @param params The parameters necessary for the multi-hop swap, encoded
   *        as ExactInputParams in calldata.
   * @return amountOut The amount of the received token.
   */
  function exactInput(ExactInputParams calldata params) external payable returns (uint256 amountOut) {}

  /**
   * @dev Unwraps WETH9 token.
   * @param amountMinimum The minimum amount of token to be unwrapped.
   * @param recipient The address to receive the unwrapped token.
   */
  function unwrapWETH9(uint256 amountMinimum, address recipient) external payable {}

  /**
   * @dev Executes multiple calls in a single transaction.
   * @param data The array of encoded function calls.
   * @return results The array of results from the function calls.
   */
  function multicall(bytes[] calldata data) external payable returns (bytes[] memory results) {}

  /**
   * @dev Refunds any ETH sent to the contract.
   */
  function refundETH() external payable {}
}
