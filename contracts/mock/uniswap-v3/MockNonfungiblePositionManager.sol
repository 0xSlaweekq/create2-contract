// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title Nonfungible Position Manager Interface
 **/
/**
 * @title Nonfungible Position Manager Interface
 * @dev This interface defines the functions and structs for managing
 *      nonfungible liquidity positions.
 */
contract MockNonfungiblePositionManager {
  /**
   * @dev Struct representing the parameters for minting a new liquidity position.
   * @param token0 The address of token0.
   * @param token1 The address of token1.
   * @param fee The fee for the liquidity position.
   * @param tickLower The lower tick of the liquidity position.
   * @param tickUpper The upper tick of the liquidity position.
   * @param amount0Desired The desired amount of token0 to be minted.
   * @param amount1Desired The desired amount of token1 to be minted.
   * @param amount0Min The minimum amount of token0 accepted.
   * @param amount1Min The minimum amount of token1 accepted.
   * @param recipient The address to receive the minted liquidity position tokens.
   * @param deadline The deadline for the minting operation.
   */
  struct MintParams {
    address token0;
    address token1;
    uint24 fee;
    int24 tickLower;
    int24 tickUpper;
    uint256 amount0Desired;
    uint256 amount1Desired;
    uint256 amount0Min;
    uint256 amount1Min;
    address recipient;
    uint256 deadline;
  }

  /**
   * @dev Struct representing the parameters for increasing liquidity.
   * @param tokenId The ID of the liquidity position token.
   * @param amount0Desired The desired amount of token0 to be added.
   * @param amount1Desired The desired amount of token1 to be added.
   * @param amount0Min The minimum amount of token0 accepted.
   * @param amount1Min The minimum amount of token1 accepted.
   * @param deadline The deadline for the liquidity increase operation.
   */
  struct IncreaseLiquidityParams {
    uint256 tokenId;
    uint256 amount0Desired;
    uint256 amount1Desired;
    uint256 amount0Min;
    uint256 amount1Min;
    uint256 deadline;
  }

  /**
   * @dev Struct representing the parameters for decreasing liquidity.
   * @param tokenId The ID of the liquidity position token.
   * @param liquidity The amount of liquidity to be removed.
   * @param amount0Min The minimum amount of token0 accepted.
   * @param amount1Min The minimum amount of token1 accepted.
   * @param deadline The deadline for the liquidity decrease operation.
   */
  struct DecreaseLiquidityParams {
    uint256 tokenId;
    uint128 liquidity;
    uint256 amount0Min;
    uint256 amount1Min;
    uint256 deadline;
  }

  /**
   * @dev Struct representing the parameters for collecting fees.
   * @param tokenId The ID of the liquidity position token.
   * @param recipient The address to receive the collected fees.
   * @param amount0Max The maximum amount of token0 to be collected.
   * @param amount1Max The maximum amount of token1 to be collected.
   */
  struct CollectParams {
    uint256 tokenId;
    address recipient;
    uint128 amount0Max;
    uint128 amount1Max;
  }

  /**
   *@notice Emitted when liquidity is increased for a position NFT
   *@dev Also emitted when a token is minted
   *@param tokenId The ID of the token for which liquidity was increased
   *@param liquidity The amount by which liquidity for the NFT position was increased
   *@param amount0 The amount of token0 that was paid for the increase in liquidity
   *@param amount1 The amount of token1 that was paid for the increase in liquidity
   */
  event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 indexed amount0, uint256 indexed amount1);

  /**
   *@notice Emitted when liquidity is decreased for a position NFT
   *@param tokenId The ID of the token for which liquidity was decreased
   *@param liquidity The amount by which liquidity for the NFT position was decreased
   *@param amount0 The amount of token0 that was accounted for the decrease in liquidity
   *@param amount1 The amount of token1 that was accounted for the decrease in liquidity
   */
  event DecreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 indexed amount0, uint256 indexed amount1);

  /**
   *@notice Emitted when tokens are collected for a position NFT
   *@dev The amounts reported may not be exactly equivalent to the amounts transferred, due to rounding behavior
   *@param tokenId The ID of the token for which underlying tokens were collected
   *@param recipient The address of the account that received the collected tokens
   *@param amount0 The amount of token0 owed to the position that was collected
   *@param amount1 The amount of token1 owed to the position that was collected
   */
  event Collect(uint256 indexed tokenId, address recipient, uint256 indexed amount0, uint256 indexed amount1);

  /**
   * @dev Mint new liquidity position tokens.
   * @param params The mint parameters.
   * @return tokenId The ID of the newly minted token.
   * @return liquidity The amount of liquidity minted.
   * @return amount0 The amount of token0 minted.
   * @return amount1 The amount of token1 minted.
   */
  function mint(
    MintParams calldata params
  ) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) {}

  /**
   * @dev Increase the liquidity of a position.
   * @param params The parameters for increasing liquidity.
   * @return liquidity The amount of liquidity added.
   * @return amount0 The amount of token0 added.
   * @return amount1 The amount of token1 added.
   */
  function increaseLiquidity(
    IncreaseLiquidityParams calldata params
  ) external payable returns (uint128 liquidity, uint256 amount0, uint256 amount1) {}

  /**
   * @dev Decrease the liquidity of a position.
   * @param params The parameters for decreasing liquidity.
   * @return amount0 The amount of token0 removed.
   * @return amount1 The amount of token1 removed.
   */
  function decreaseLiquidity(
    DecreaseLiquidityParams calldata params
  ) external payable returns (uint256 amount0, uint256 amount1) {}

  /**
   * @dev Collect fees from a liquidity position.
   * @param params The parameters for collecting fees.
   * @return amount0 The amount of token0 collected.
   * @return amount1 The amount of token1 collected.
   */
  function collect(CollectParams calldata params) external payable returns (uint256 amount0, uint256 amount1) {}

  function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId) {}

  function positions(
    uint256 tokenId
  )
    external
    view
    returns (
      uint96 nonce,
      address operator,
      address token0,
      address token1,
      uint24 fee,
      int24 tickLower,
      int24 tickUpper,
      uint128 liquidity,
      uint256 feeGrowthInside0LastX128,
      uint256 feeGrowthInside1LastX128,
      uint128 tokensOwed0,
      uint128 tokensOwed1
    )
  {}
  function balanceOf(address owner) public view returns (uint256) {}
}
