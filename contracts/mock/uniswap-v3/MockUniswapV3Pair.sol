// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title Mock Uniswap V3 Pair
 * @author Publius
 * @dev This contract is a mock implementation of the Uniswap V3 Pair contract.
 */
contract MockUniswapV3Pair {
    /**
     * @title Info
     * @dev This struct represents the tick information for a given tick in a Uniswap V3 Pair contract.
     * @param liquidityGross The total position liquidity that references this tick.
     * @param liquidityNet The amount of net liquidity added (subtracted) when
     *        the tick is crossed from left to right (right to left).
     *
     * @param feeGrowthOutside0X128 The fee growth per unit of liquidity on the _other_
     * @param feeGrowthOutside1X128 side of this tick (relative to the current tick).
     *        This value only has relative meaning, not absolute, and depends
     *        on when the tick is initialized.
     *
     * @param tickCumulativeOutside The cumulative tick value on the other side
     * @param secondsPerLiquidityOutsideX128 of the tick. The seconds per unit
     *        of liquidity on the _other_ side of this tick (relative to the current tick).
     *        This value only has relative meaning, not absolute, and depends
     *        on when the tick is initialized.
     * @param secondsOutside The seconds spent on the other side of the tick
     *        (relative to the current tick). This value only has relative meaning,
     *        not absolute, and depends on when the tick is initialized.
     * @param initialized A boolean indicating whether the tick is initialized.
     *        It is true if the value is exactly equivalent to the expression
     *        liquidityGross != 0. These 8 bits are set to prevent fresh sstores
     *        when crossing newly initialized ticks.
     */
    struct Info {
        uint128 liquidityGross;
        int128 liquidityNet;
        uint256 feeGrowthOutside0X128;
        uint256 feeGrowthOutside1X128;
        int56 tickCumulativeOutside;
        uint160 secondsPerLiquidityOutsideX128;
        uint32 secondsOutside;
        bool initialized;
    }

    /**
     * @dev Retrieves the tick information for a given tick.
     * @param . tick The tick value.
     * @return . info The tick information.
     */
    function ticks(int24) external view returns (Info memory) {}

    /**
     * @dev Retrieves the slot0 information.
     * @return sqrtPriceX96 The square root of the price.
     * @return tick The current tick value.
     * @return observationIndex The current observation index.
     * @return observationCardinality The current observation cardinality.
     * @return observationCardinalityNext The next observation cardinality.
     * @return feeProtocol The fee protocol.
     * @return unlocked Whether the contract is unlocked.
     */
    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        )
    {}

    /**
     * @dev Retrieves the tick spacing.
     * @return . The tick spacing.
     */
    function tickSpacing() external view returns (int24) {}

    /**
     * @dev Retrieves the fee.
     * @return . The fee.
     */
    function fee() external view returns (uint24) {}
}
