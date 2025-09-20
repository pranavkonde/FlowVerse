const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreeFlowDEX", function () {
  let freeFlowDEX;
  let owner;
  let user1;
  let user2;
  let mockTokenA;
  let mockTokenB;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 tokens for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockTokenA = await MockERC20.deploy("TokenA", "TKA", ethers.utils.parseEther("1000000"));
    mockTokenB = await MockERC20.deploy("TokenB", "TKB", ethers.utils.parseEther("1000000"));

    // Deploy FreeFlowDEX
    const FreeFlowDEX = await ethers.getContractFactory("FreeFlowDEX");
    freeFlowDEX = await FreeFlowDEX.deploy();

    // Add mock tokens as supported tokens
    await freeFlowDEX.addSupportedToken(mockTokenA.address);
    await freeFlowDEX.addSupportedToken(mockTokenB.address);

    // Transfer tokens to users for testing
    await mockTokenA.transfer(user1.address, ethers.utils.parseEther("1000"));
    await mockTokenB.transfer(user1.address, ethers.utils.parseEther("1000"));
    await mockTokenA.transfer(user2.address, ethers.utils.parseEther("1000"));
    await mockTokenB.transfer(user2.address, ethers.utils.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await freeFlowDEX.owner()).to.equal(owner.address);
    });

    it("Should have correct fee percentage", async function () {
      expect(await freeFlowDEX.FEE_PERCENTAGE()).to.equal(30); // 0.3%
    });
  });

  describe("Token Support", function () {
    it("Should add supported token", async function () {
      await freeFlowDEX.addSupportedToken(mockTokenA.address);
      expect(await freeFlowDEX.supportedTokens(mockTokenA.address)).to.be.true;
    });

    it("Should remove supported token", async function () {
      await freeFlowDEX.removeSupportedToken(mockTokenA.address);
      expect(await freeFlowDEX.supportedTokens(mockTokenA.address)).to.be.false;
    });
  });

  describe("Liquidity", function () {
    it("Should add liquidity", async function () {
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("200");

      await mockTokenA.connect(user1).approve(freeFlowDEX.address, amountA);
      await mockTokenB.connect(user1).approve(freeFlowDEX.address, amountB);

      await expect(freeFlowDEX.connect(user1).addLiquidity(
        mockTokenA.address,
        mockTokenB.address,
        amountA,
        amountB
      )).to.emit(freeFlowDEX, "LiquidityAdded");
    });

    it("Should remove liquidity", async function () {
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("200");

      // First add liquidity
      await mockTokenA.connect(user1).approve(freeFlowDEX.address, amountA);
      await mockTokenB.connect(user1).approve(freeFlowDEX.address, amountB);
      await freeFlowDEX.connect(user1).addLiquidity(
        mockTokenA.address,
        mockTokenB.address,
        amountA,
        amountB
      );

      // Then remove liquidity
      await expect(freeFlowDEX.connect(user1).removeLiquidity(
        mockTokenA.address,
        mockTokenB.address,
        amountA,
        amountB
      )).to.emit(freeFlowDEX, "LiquidityRemoved");
    });
  });

  describe("Swapping", function () {
    beforeEach(async function () {
      // Add initial liquidity
      const amountA = ethers.utils.parseEther("1000");
      const amountB = ethers.utils.parseEther("2000");

      await mockTokenA.connect(user1).approve(freeFlowDEX.address, amountA);
      await mockTokenB.connect(user1).approve(freeFlowDEX.address, amountB);
      await freeFlowDEX.connect(user1).addLiquidity(
        mockTokenA.address,
        mockTokenB.address,
        amountA,
        amountB
      );
    });

    it("Should execute swap", async function () {
      const amountIn = ethers.utils.parseEther("100");
      const minAmountOut = ethers.utils.parseEther("190"); // Account for fees

      await mockTokenA.connect(user2).approve(freeFlowDEX.address, amountIn);

      await expect(freeFlowDEX.connect(user2).swap(
        mockTokenA.address,
        mockTokenB.address,
        amountIn,
        minAmountOut
      )).to.emit(freeFlowDEX, "SwapExecuted");
    });

    it("Should calculate correct amount out", async function () {
      const amountIn = ethers.utils.parseEther("100");
      const amountOut = await freeFlowDEX.getAmountOut(
        mockTokenA.address,
        mockTokenB.address,
        amountIn
      );

      expect(amountOut).to.be.gt(0);
    });

    it("Should calculate correct amount in", async function () {
      const amountOut = ethers.utils.parseEther("200");
      const amountIn = await freeFlowDEX.getAmountIn(
        mockTokenA.address,
        mockTokenB.address,
        amountOut
      );

      expect(amountIn).to.be.gt(0);
    });
  });
});

// Mock ERC20 contract for testing
contract("MockERC20", function () {
  // This would be implemented as a separate contract file in a real project
});
