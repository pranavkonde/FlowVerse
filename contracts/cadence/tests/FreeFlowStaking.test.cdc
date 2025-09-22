import Test
import FungibleToken from 0x9a0766d93b6608b7
import FreeFlowToken from 0x01
import FreeFlowStaking from 0x02

/// Comprehensive test suite for FreeFlowStaking contract
access(all) fun main() {
    
    let test = Test.newTest()
    
    // Test account setup
    let admin = test.createAccount()
    let staker1 = test.createAccount()
    let staker2 = test.createAccount()
    
    // Deploy contracts
    test.deployContract(
        name: "FreeFlowToken",
        path: "../contracts/FreeFlowToken.cdc",
        arguments: []
    )
    
    test.deployContract(
        name: "FreeFlowStaking",
        path: "../contracts/FreeFlowStaking.cdc",
        arguments: []
    )
    
    // Setup accounts
    test.setupAccount(admin)
    test.setupAccount(staker1)
    test.setupAccount(staker2)
    
    // Run tests
    test.run("testStakingTiers", testStakingTiers)
    test.run("testStakeTokens", testStakeTokens)
    test.run("testClaimRewards", testClaimRewards)
    test.run("testUnstakeTokens", testUnstakeTokens)
    test.run("testEmergencyUnstake", testEmergencyUnstake)
    test.run("testPoolStatistics", testPoolStatistics)
    test.run("testAdminFunctions", testAdminFunctions)
    test.run("testSecurityFeatures", testSecurityFeatures)
    
    test.cleanup(admin)
    test.cleanup(staker1)
    test.cleanup(staker2)
}

/// Test staking tiers configuration
access(all) fun testStakingTiers(test: Test) {
    test.assertEqual(
        FreeFlowStaking.getStakingTier(tierName: "30day")?.rewardRate,
        500.0,
        message: "30-day tier should have 5% APR"
    )
    
    test.assertEqual(
        FreeFlowStaking.getStakingTier(tierName: "365day")?.rewardRate,
        1800.0,
        message: "365-day tier should have 18% APR"
    )
    
    test.assertEqual(
        FreeFlowStaking.getStakingTier(tierName: "nonexistent"),
        nil,
        message: "Non-existent tier should return nil"
    )
}

/// Test staking tokens functionality
access(all) fun testStakeTokens(test: Test) {
    let staker = test.getAccount(0x02) // staker1
    
    // Mint some tokens to staker
    let admin = FreeFlowToken.getAdmin()
    let stakerVault = staker.getCapability<&FreeFlowToken.Vault>(/public/FreeFlowTokenVault)
        .borrow() ?? panic("Could not borrow vault")
    
    admin.mintTokens(amount: 10000.0, recipient: &stakerVault)
    
    // Test staking
    let stakingAdmin = FreeFlowStaking.getAdmin()
    let positionID = stakingAdmin.stakeTokens(
        staker: &stakerVault,
        amount: 1000.0,
        tier: "30day"
    )
    
    test.assertEqual(positionID, 1, message: "First position should have ID 1")
    
    // Verify position was created
    let position = FreeFlowStaking.getPosition(positionID: positionID)
    test.assertNotEqual(position, nil, message: "Position should exist")
    test.assertEqual(position?.amount, 1000.0, message: "Position amount should be 1000")
    test.assertEqual(position?.tier, "30day", message: "Position tier should be 30day")
    
    // Verify total staked increased
    test.assertEqual(
        FreeFlowStaking.getTotalStaked(),
        1000.0,
        message: "Total staked should be 1000"
    )
}

/// Test claiming rewards functionality
access(all) fun testClaimRewards(test: Test) {
    let staker = test.getAccount(0x02) // staker1
    
    // Get existing position
    let positions = FreeFlowStaking.getPositionsByOwner(owner: staker.address)
    test.assertNotEqual(positions.length, 0, message: "Staker should have positions")
    
    let position = positions[0]
    let initialPendingRewards = position.calculatePendingRewards()
    
    // Fast forward time to generate rewards
    test.advanceTime(by: 86400.0) // 1 day
    
    let newPendingRewards = position.calculatePendingRewards()
    test.assertGreater(newPendingRewards, initialPendingRewards, message: "Rewards should increase over time")
    
    // Claim rewards
    let stakerVault = staker.getCapability<&FreeFlowToken.Vault>(/public/FreeFlowTokenVault)
        .borrow() ?? panic("Could not borrow vault")
    
    let initialBalance = stakerVault.getBalance()
    let stakingAdmin = FreeFlowStaking.getAdmin()
    let claimedRewards = stakingAdmin.claimRewards(
        positionID: position.id,
        staker: &stakerVault
    )
    
    test.assertGreater(claimedRewards, 0.0, message: "Should claim some rewards")
    test.assertEqual(
        stakerVault.getBalance(),
        initialBalance + claimedRewards,
        message: "Balance should increase by claimed rewards"
    )
}

/// Test unstaking tokens functionality
access(all) fun testUnstakeTokens(test: Test) {
    let staker = test.getAccount(0x02) // staker1
    
    // Get existing position
    let positions = FreeFlowStaking.getPositionsByOwner(owner: staker.address)
    let position = positions[0]
    
    // Fast forward time to unlock period
    test.advanceTime(by: 2592000.0) // 30 days
    
    // Verify position can be unstaked
    test.assertTrue(position.canUnstake(), message: "Position should be unlockable after 30 days")
    
    // Unstake tokens
    let stakerVault = staker.getCapability<&FreeFlowToken.Vault>(/public/FreeFlowTokenVault)
        .borrow() ?? panic("Could not borrow vault")
    
    let initialBalance = stakerVault.getBalance()
    let stakingAdmin = FreeFlowStaking.getAdmin()
    let rewards = stakingAdmin.unstakeTokens(
        positionID: position.id,
        staker: &stakerVault
    )
    
    test.assertGreater(rewards, 0.0, message: "Should receive rewards on unstaking")
    test.assertEqual(
        stakerVault.getBalance(),
        initialBalance + position.amount + rewards,
        message: "Should receive staked amount plus rewards"
    )
    
    // Verify position is deactivated
    test.assertFalse(position.isActive, message: "Position should be deactivated after unstaking")
    
    // Verify total staked decreased
    test.assertEqual(
        FreeFlowStaking.getTotalStaked(),
        0.0,
        message: "Total staked should be 0 after unstaking"
    )
}

/// Test emergency unstake functionality
access(all) fun testEmergencyUnstake(test: Test) {
    let staker = test.getAccount(0x02) // staker1
    
    // Stake new tokens
    let stakerVault = staker.getCapability<&FreeFlowToken.Vault>(/public/FreeFlowTokenVault)
        .borrow() ?? panic("Could not borrow vault")
    
    let admin = FreeFlowToken.getAdmin()
    admin.mintTokens(amount: 10000.0, recipient: &stakerVault)
    
    let stakingAdmin = FreeFlowStaking.getAdmin()
    let positionID = stakingAdmin.stakeTokens(
        staker: &stakerVault,
        amount: 2000.0,
        tier: "90day"
    )
    
    let position = FreeFlowStaking.getPosition(positionID: positionID)
    test.assertNotEqual(position, nil, message: "Position should exist")
    
    // Fast forward time to generate some rewards
    test.advanceTime(by: 86400.0) // 1 day
    
    // Emergency unstake
    let initialBalance = stakerVault.getBalance()
    let totalReturned = stakingAdmin.emergencyUnstake(
        positionID: positionID,
        staker: &stakerVault
    )
    
    // Should receive 50% of staked amount + 50% of rewards
    let expectedReturn = position!.amount * 0.5 + position!.calculatePendingRewards() * 0.5
    test.assertApproximatelyEqual(
        totalReturned,
        expectedReturn,
        tolerance: 0.01,
        message: "Should receive approximately 50% of total value"
    )
    
    test.assertEqual(
        stakerVault.getBalance(),
        initialBalance + totalReturned,
        message: "Balance should increase by returned amount"
    )
}

/// Test pool statistics functionality
access(all) fun testPoolStatistics(test: Test) {
    let poolStats = FreeFlowStaking.getPoolStats()
    
    test.assertNotEqual(poolStats["totalStaked"], nil, message: "Should have total staked")
    test.assertNotEqual(poolStats["activePositions"], nil, message: "Should have active positions count")
    test.assertNotEqual(poolStats["totalPendingRewards"], nil, message: "Should have total pending rewards")
    
    test.assertEqual(
        FreeFlowStaking.getTotalStaked(),
        poolStats["totalStaked"] as! UFix64,
        message: "Pool stats should match contract totals"
    )
}

/// Test admin functions
access(all) fun testAdminFunctions(test: Test) {
    let admin = FreeFlowStaking.getAdmin()
    
    // Test adding new staking tier
    admin.addStakingTier(
        tierName: "7day",
        lockPeriod: 604800.0, // 7 days
        rewardRate: 200.0, // 2% APR
        minStakeAmount: 50.0,
        maxStakeAmount: 5000.0
    )
    
    let newTier = FreeFlowStaking.getStakingTier(tierName: "7day")
    test.assertNotEqual(newTier, nil, message: "New tier should exist")
    test.assertEqual(newTier?.rewardRate, 200.0, message: "New tier should have correct reward rate")
    
    // Test updating existing tier
    admin.updateStakingTier(
        tierName: "7day",
        lockPeriod: nil,
        rewardRate: 300.0, // 3% APR
        minStakeAmount: nil,
        maxStakeAmount: nil,
        isActive: nil
    )
    
    let updatedTier = FreeFlowStaking.getStakingTier(tierName: "7day")
    test.assertEqual(updatedTier?.rewardRate, 300.0, message: "Tier should be updated")
    
    // Test pause functionality
    test.assertFalse(FreeFlowStaking.isStakingPaused(), message: "Staking should not be paused initially")
    
    admin.setPauseStatus(paused: true)
    test.assertTrue(FreeFlowStaking.isStakingPaused(), message: "Staking should be paused")
    
    admin.setPauseStatus(paused: false)
    test.assertFalse(FreeFlowStaking.isStakingPaused(), message: "Staking should be unpaused")
}

/// Test security features
access(all) fun testSecurityFeatures(test: Test) {
    let staker = test.getAccount(0x02) // staker1
    let stakerVault = staker.getCapability<&FreeFlowToken.Vault>(/public/FreeFlowTokenVault)
        .borrow() ?? panic("Could not borrow vault")
    
    let stakingAdmin = FreeFlowStaking.getAdmin()
    
    // Test staking with insufficient balance
    test.expectFailure(
        message: "Should fail when staking more than balance"
    ) {
        stakingAdmin.stakeTokens(
            staker: &stakerVault,
            amount: 100000.0, // More than balance
            tier: "30day"
        )
    }
    
    // Test staking with invalid tier
    test.expectFailure(
        message: "Should fail with invalid tier"
    ) {
        stakingAdmin.stakeTokens(
            staker: &stakerVault,
            amount: 1000.0,
            tier: "invalid"
        )
    }
    
    // Test staking below minimum amount
    test.expectFailure(
        message: "Should fail below minimum stake"
    ) {
        stakingAdmin.stakeTokens(
            staker: &stakerVault,
            amount: 50.0, // Below minimum
            tier: "30day"
        )
    }
    
    // Test unstaking before lock period
    let positionID = stakingAdmin.stakeTokens(
        staker: &stakerVault,
        amount: 1000.0,
        tier: "90day"
    )
    
    test.expectFailure(
        message: "Should fail to unstake before lock period"
    ) {
        stakingAdmin.unstakeTokens(
            positionID: positionID,
            staker: &stakerVault
        )
    }
}
