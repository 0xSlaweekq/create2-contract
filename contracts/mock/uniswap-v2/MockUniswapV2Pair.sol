// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title Mock Uniswap V2 Pair
 * @dev This contract simulates a Uniswap V2 pair and provides a function to
 *      retrieve the balance of a specific owner.
 * @author Publius
 */
contract MockUniswapV2Pair {
    /**
     * @dev Returns the balance of the specified owner.
     * @param owner The address of the owner to retrieve the balance for.
     * @return The balance of the specified owner.
     */
    function balanceOf(address owner) external view returns (uint256) {}
}
