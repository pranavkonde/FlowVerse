// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FreeFlowDEX
 * @dev A decentralized exchange contract for the Flow ecosystem
 * @author Free Flow Team
 */
contract FreeFlowDEX is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 timestamp
    );

    event LiquidityAdded(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 timestamp
    );

    event LiquidityRemoved(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 timestamp
    );

    // State variables
    uint256 public constant FEE_PERCENTAGE = 30; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    mapping(address => mapping(address => uint256)) public liquidity;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public tokenReserves;

    // Modifiers
    modifier onlySupportedToken(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        _;
    }

    constructor() {
        // Initialize with FLOW and WFLOW as supported tokens
        // These addresses should be updated for actual Flow testnet/mainnet
        supportedTokens[0x7e60df042a9c0868] = true; // FLOW
        supportedTokens[0x1654653399040a61] = true; // WFLOW
    }

    /**
     * @dev Add a new supported token
     * @param token Address of the token to support
     */
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
    }

    /**
     * @dev Remove support for a token
     * @param token Address of the token to remove
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    /**
     * @dev Add liquidity to the DEX
     * @param tokenA Address of first token
     * @param tokenB Address of second token
     * @param amountA Amount of tokenA to add
     * @param amountB Amount of tokenB to add
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external onlySupportedToken(tokenA) onlySupportedToken(tokenB) validAmount(amountA) validAmount(amountB) {
        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        liquidity[tokenA][tokenB] += amountA;
        liquidity[tokenB][tokenA] += amountB;
        tokenReserves[tokenA] += amountA;
        tokenReserves[tokenB] += amountB;

        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB, block.timestamp);
    }

    /**
     * @dev Remove liquidity from the DEX
     * @param tokenA Address of first token
     * @param tokenB Address of second token
     * @param amountA Amount of tokenA to remove
     * @param amountB Amount of tokenB to remove
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external onlySupportedToken(tokenA) onlySupportedToken(tokenB) validAmount(amountA) validAmount(amountB) {
        require(liquidity[tokenA][tokenB] >= amountA, "Insufficient liquidity");
        require(liquidity[tokenB][tokenA] >= amountB, "Insufficient liquidity");

        liquidity[tokenA][tokenB] -= amountA;
        liquidity[tokenB][tokenA] -= amountB;
        tokenReserves[tokenA] -= amountA;
        tokenReserves[tokenB] -= amountB;

        IERC20(tokenA).safeTransfer(msg.sender, amountA);
        IERC20(tokenB).safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, tokenA, tokenB, amountA, amountB, block.timestamp);
    }

    /**
     * @dev Execute a token swap
     * @param tokenIn Address of input token
     * @param tokenOut Address of output token
     * @param amountIn Amount of input token
     * @param minAmountOut Minimum amount of output token expected
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external onlySupportedToken(tokenIn) onlySupportedToken(tokenOut) validAmount(amountIn) nonReentrant {
        require(tokenIn != tokenOut, "Cannot swap same token");
        
        uint256 amountOut = getAmountOut(tokenIn, tokenOut, amountIn);
        require(amountOut >= minAmountOut, "Insufficient output amount");

        // Transfer input tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Calculate and collect fee
        uint256 fee = (amountIn * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - fee;

        // Update reserves
        tokenReserves[tokenIn] += amountInAfterFee;
        tokenReserves[tokenOut] -= amountOut;

        // Transfer output tokens to user
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut, block.timestamp);
    }

    /**
     * @dev Get the amount of output tokens for a given input
     * @param tokenIn Address of input token
     * @param tokenOut Address of output token
     * @param amountIn Amount of input token
     * @return amountOut Amount of output token
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view returns (uint256 amountOut) {
        require(supportedTokens[tokenIn] && supportedTokens[tokenOut], "Token not supported");
        require(tokenIn != tokenOut, "Cannot swap same token");

        uint256 reserveIn = tokenReserves[tokenIn];
        uint256 reserveOut = tokenReserves[tokenOut];
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENTAGE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        
        amountOut = numerator / denominator;
    }

    /**
     * @dev Get the amount of input tokens needed for a given output
     * @param tokenIn Address of input token
     * @param tokenOut Address of output token
     * @param amountOut Amount of output token desired
     * @return amountIn Amount of input token needed
     */
    function getAmountIn(
        address tokenIn,
        address tokenOut,
        uint256 amountOut
    ) public view returns (uint256 amountIn) {
        require(supportedTokens[tokenIn] && supportedTokens[tokenOut], "Token not supported");
        require(tokenIn != tokenOut, "Cannot swap same token");

        uint256 reserveIn = tokenReserves[tokenIn];
        uint256 reserveOut = tokenReserves[tokenOut];
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 numerator = reserveIn * amountOut * FEE_DENOMINATOR;
        uint256 denominator = (reserveOut - amountOut) * (FEE_DENOMINATOR - FEE_PERCENTAGE);
        
        amountIn = (numerator / denominator) + 1; // Add 1 to account for rounding
    }

    /**
     * @dev Get current reserves for a token pair
     * @param tokenA Address of first token
     * @param tokenB Address of second token
     * @return reserveA Reserve of tokenA
     * @return reserveB Reserve of tokenB
     */
    function getReserves(address tokenA, address tokenB) external view returns (uint256 reserveA, uint256 reserveB) {
        reserveA = tokenReserves[tokenA];
        reserveB = tokenReserves[tokenB];
    }

    /**
     * @dev Emergency function to withdraw tokens (only owner)
     * @param token Address of token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
