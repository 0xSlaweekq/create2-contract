// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @author Publius
 * @title Mock Uniswap V2 Router
 **/
/**
 * @title Mock Uniswap V2 Router
 * @dev This contract serves as a mock implementation of the Uniswap V2 Router contract.
 *      It provides functions for swapping ETH for tokens and getting
 *      the input amounts for a given output amount.
 *      The contract is intended for testing and demonstration purposes only.
 */
contract MockUniswapV2Router {
    /**
     * @dev Swaps an exact amount of ETH for tokens.
     * @param amountOutMin The minimum amount of tokens that must be received
     *        for the swap to be considered successful.
     * @param path The path of tokens to be swapped. The first token is
     *        the input token (ETH) and the last token is the output token.
     * @param to The address to receive the swapped tokens.
     * @param deadline The deadline by which the swap must be executed.
     * @return amounts An array of amounts that were swapped, including
     *         the input and output amounts.
     */
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint[] memory amounts) {}

    /**
     * @dev Swaps an amount of ETH for an exact amount of tokens.
     * @param amountOut The exact amount of tokens to be received from the swap.
     * @param path The path of tokens to be swapped. The first token is
     *        the input token (ETH) and the last token is the output token.
     * @param to The address to receive the swapped tokens.
     * @param deadline The deadline by which the swap must be executed.
     * @return amounts An array of amounts that were swapped, including
     *         the input and output amounts.
     */
    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint[] memory amounts) {}

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity) {}

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity) {}

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB) {}

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH) {}

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable {}

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external {}

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {}

    /**
     * @dev Calculates the input amounts required to receive a given
     *      output amount of tokens.
     * @param amountOut The desired output amount of tokens.
     * @param path The path of tokens to be swapped. The first token is
     *        the input token (ETH) and the last token is the output token.
     * @return amounts An array of input amounts required to receive
     *         the desired output amount.
     */
    function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint[] memory amounts) {}
    function WETH() external pure returns (address) {}
}
