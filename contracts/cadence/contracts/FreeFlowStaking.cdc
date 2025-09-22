import FungibleToken from 0x9a0766d93b6608b7
import FreeFlowToken from 0x01

/// FreeFlowStaking - A staking contract for FFT tokens with time-locked rewards
/// This contract allows users to stake FFT tokens for different time periods and earn rewards
pub contract FreeFlowStaking {
    
    // Staking Information
    pub let name: String
    pub let description: String
    pub let version: String
    
    // Staking tiers with different lock periods and reward rates
    pub let stakingTiers: {String: StakingTier}
    
    // Total staked amount across all users
    pub var totalStaked: UFix64
    
    // Total rewards distributed
    pub var totalRewardsDistributed: UFix64
    
    // Emergency pause flag
    pub var isPaused: Bool
    
    // Staking Tier Structure
    pub struct StakingTier {
        pub let lockPeriod: UFix64 // in seconds
        pub let rewardRate: UFix64 // annual percentage rate (e.g., 1000 = 10%)
        pub let minStakeAmount: UFix64
        pub let maxStakeAmount: UFix64
        pub let isActive: Bool
        
        init(
            lockPeriod: UFix64,
            rewardRate: UFix64,
            minStakeAmount: UFix64,
            maxStakeAmount: UFix64,
            isActive: Bool
        ) {
            self.lockPeriod = lockPeriod
            self.rewardRate = rewardRate
            self.minStakeAmount = minStakeAmount
            self.maxStakeAmount = maxStakeAmount
            self.isActive = isActive
        }
    }
    
    // Staking Position Resource
    pub resource StakingPosition {
        pub let id: UInt64
        pub let owner: Address
        pub let tier: String
        pub let amount: UFix64
        pub let stakedAt: UFix64
        pub let unlockAt: UFix64
        pub let rewardRate: UFix64
        pub var lastClaimedAt: UFix64
        pub var totalClaimed: UFix64
        pub let isActive: Bool
        
        init(
            id: UInt64,
            owner: Address,
            tier: String,
            amount: UFix64,
            rewardRate: UFix64
        ) {
            self.id = id
            self.owner = owner
            self.tier = tier
            self.amount = amount
            self.stakedAt = getCurrentBlock().timestamp
            self.unlockAt = getCurrentBlock().timestamp + FreeFlowStaking.stakingTiers[tier]!.lockPeriod
            self.rewardRate = rewardRate
            self.lastClaimedAt = getCurrentBlock().timestamp
            self.totalClaimed = 0.0
            self.isActive = true
        }
        
        // Calculate pending rewards
        pub fun calculatePendingRewards(): UFix64 {
            if !self.isActive {
                return 0.0
            }
            
            let currentTime = getCurrentBlock().timestamp
            let timeElapsed = currentTime - self.lastClaimedAt
            let secondsInYear: UFix64 = 31536000.0 // 365 * 24 * 3600
            
            // Calculate annual reward amount
            let annualReward = self.amount * self.rewardRate / 10000.0
            
            // Calculate pending rewards based on time elapsed
            let pendingRewards = annualReward * timeElapsed / secondsInYear
            
            return pendingRewards
        }
        
        // Check if position can be unstaked
        pub fun canUnstake(): Bool {
            return getCurrentBlock().timestamp >= self.unlockAt
        }
        
        // Update last claimed timestamp
        pub fun updateLastClaimed() {
            self.lastClaimedAt = getCurrentBlock().timestamp
        }
        
        // Add to total claimed amount
        pub fun addToTotalClaimed(amount: UFix64) {
            self.totalClaimed = self.totalClaimed + amount
        }
        
        // Deactivate position
        pub fun deactivate() {
            self.isActive = false
        }
    }
    
    // Staking Pool Resource
    pub resource StakingPool {
        pub var positions: {UInt64: StakingPosition}
        pub var nextPositionID: UInt64
        pub var totalPositions: UInt64
        pub var activePositions: UInt64
        
        init() {
            self.positions = {}
            self.nextPositionID = 1
            self.totalPositions = 0
            self.activePositions = 0
        }
        
        // Create new staking position
        pub fun createPosition(
            owner: Address,
            tier: String,
            amount: UFix64
        ): @StakingPosition {
            let tierInfo = FreeFlowStaking.stakingTiers[tier]
                ?? panic("Invalid staking tier")
            
            pre {
                tierInfo.isActive: "Staking tier is not active"
                amount >= tierInfo.minStakeAmount: "Amount below minimum stake"
                amount <= tierInfo.maxStakeAmount: "Amount above maximum stake"
            }
            
            let positionID = self.nextPositionID
            self.nextPositionID = self.nextPositionID + 1
            self.totalPositions = self.totalPositions + 1
            self.activePositions = self.activePositions + 1
            
            let position <- create StakingPosition(
                id: positionID,
                owner: owner,
                tier: tier,
                amount: amount,
                rewardRate: tierInfo.rewardRate
            )
            
            self.positions[positionID] <-! position
            
            return <-position
        }
        
        // Get position by ID
        pub fun getPosition(id: UInt64): &StakingPosition? {
            return &self.positions[id]
        }
        
        // Get all positions for an owner
        pub fun getPositionsByOwner(owner: Address): [&StakingPosition] {
            var result: [&StakingPosition] = []
            for positionID in self.positions.keys {
                let position = &self.positions[positionID]!
                if position.owner == owner && position.isActive {
                    result.append(position)
                }
            }
            return result
        }
        
        // Remove position
        pub fun removePosition(id: UInt64): @StakingPosition {
            let position <- self.positions.remove(key: id)
                ?? panic("Position not found")
            
            if position.isActive {
                self.activePositions = self.activePositions - 1
            }
            
            return <-position
        }
        
        // Get pool statistics
        pub fun getPoolStats(): {String: UFix64} {
            var totalStaked: UFix64 = 0.0
            var totalPendingRewards: UFix64 = 0.0
            
            for positionID in self.positions.keys {
                let position = &self.positions[positionID]!
                if position.isActive {
                    totalStaked = totalStaked + position.amount
                    totalPendingRewards = totalPendingRewards + position.calculatePendingRewards()
                }
            }
            
            return {
                "totalStaked": totalStaked,
                "totalPendingRewards": totalPendingRewards,
                "activePositions": UFix64(self.activePositions),
                "totalPositions": UFix64(self.totalPositions)
            }
        }
        
        destroy() {
            destroy self.positions
        }
    }
    
    // Admin Resource
    pub resource Admin {
        
        // Stake tokens
        pub fun stakeTokens(
            staker: &FungibleToken.Vault,
            amount: UFix64,
            tier: String
        ): UInt64 {
            pre {
                !FreeFlowStaking.isPaused: "Staking is currently paused"
                amount > 0.0: "Stake amount must be positive"
            }
            
            let tierInfo = FreeFlowStaking.stakingTiers[tier]
                ?? panic("Invalid staking tier")
            
            pre {
                tierInfo.isActive: "Staking tier is not active"
                amount >= tierInfo.minStakeAmount: "Amount below minimum stake"
                amount <= tierInfo.maxStakeAmount: "Amount above maximum stake"
            }
            
            // Withdraw tokens from staker's vault
            let stakedTokens <- staker.withdraw(amount: amount)
            
            // Create staking position
            let position <- FreeFlowStaking.pool.createPosition(
                owner: staker.owner?.address ?? panic("Invalid vault owner"),
                tier: tier,
                amount: amount
            )
            
            let positionID = position.id
            
            // Store position in pool
            FreeFlowStaking.pool.positions[positionID] <-! position
            
            // Update total staked
            FreeFlowStaking.totalStaked = FreeFlowStaking.totalStaked + amount
            
            return positionID
        }
        
        // Unstake tokens
        pub fun unstakeTokens(
            positionID: UInt64,
            staker: &FungibleToken.Vault
        ): UFix64 {
            pre {
                !FreeFlowStaking.isPaused: "Staking is currently paused"
            }
            
            let position <- FreeFlowStaking.pool.removePosition(id: positionID)
            
            pre {
                position.owner == staker.owner?.address: "Not the owner of this position"
                position.canUnstake(): "Position is still locked"
                position.isActive: "Position is not active"
            }
            
            // Calculate final rewards
            let finalRewards = position.calculatePendingRewards()
            
            // Update total claimed
            position.addToTotalClaimed(finalRewards)
            position.deactivate()
            
            // Update totals
            FreeFlowStaking.totalStaked = FreeFlowStaking.totalStaked - position.amount
            FreeFlowStaking.totalRewardsDistributed = FreeFlowStaking.totalRewardsDistributed + finalRewards
            
            // Return staked amount
            let returnVault <- create FreeFlowToken.Vault(balance: position.amount)
            staker.deposit(from: <-returnVault)
            
            // Return rewards
            let rewardVault <- create FreeFlowToken.Vault(balance: finalRewards)
            staker.deposit(from: <-rewardVault)
            
            destroy position
            
            return finalRewards
        }
        
        // Claim rewards
        pub fun claimRewards(
            positionID: UInt64,
            staker: &FungibleToken.Vault
        ): UFix64 {
            pre {
                !FreeFlowStaking.isPaused: "Staking is currently paused"
            }
            
            let position = FreeFlowStaking.pool.getPosition(id: positionID)
                ?? panic("Position not found")
            
            pre {
                position.owner == staker.owner?.address: "Not the owner of this position"
                position.isActive: "Position is not active"
            }
            
            let pendingRewards = position.calculatePendingRewards()
            
            pre {
                pendingRewards > 0.0: "No rewards to claim"
            }
            
            // Update position
            position.updateLastClaimed()
            position.addToTotalClaimed(pendingRewards)
            
            // Update total rewards distributed
            FreeFlowStaking.totalRewardsDistributed = FreeFlowStaking.totalRewardsDistributed + pendingRewards
            
            // Transfer rewards to staker
            let rewardVault <- create FreeFlowToken.Vault(balance: pendingRewards)
            staker.deposit(from: <-rewardVault)
            
            return pendingRewards
        }
        
        // Emergency unstake (with penalty)
        pub fun emergencyUnstake(
            positionID: UInt64,
            staker: &FungibleToken.Vault
        ): UFix64 {
            pre {
                !FreeFlowStaking.isPaused: "Staking is currently paused"
            }
            
            let position <- FreeFlowStaking.pool.removePosition(id: positionID)
            
            pre {
                position.owner == staker.owner?.address: "Not the owner of this position"
                position.isActive: "Position is not active"
            }
            
            // Calculate penalty (50% of staked amount)
            let penalty = position.amount * 5000 / 10000 // 50%
            let returnAmount = position.amount - penalty
            
            // Calculate partial rewards (only for time already staked)
            let partialRewards = position.calculatePendingRewards() * 5000 / 10000 // 50% of rewards
            
            // Update totals
            FreeFlowStaking.totalStaked = FreeFlowStaking.totalStaked - position.amount
            FreeFlowStaking.totalRewardsDistributed = FreeFlowStaking.totalRewardsDistributed + partialRewards
            
            // Return reduced amount
            let returnVault <- create FreeFlowToken.Vault(balance: returnAmount)
            staker.deposit(from: <-returnVault)
            
            // Return partial rewards
            let rewardVault <- create FreeFlowToken.Vault(balance: partialRewards)
            staker.deposit(from: <-rewardVault)
            
            destroy position
            
            return returnAmount + partialRewards
        }
        
        // Update staking tier
        pub fun updateStakingTier(
            tierName: String,
            lockPeriod: UFix64?,
            rewardRate: UFix64?,
            minStakeAmount: UFix64?,
            maxStakeAmount: UFix64?,
            isActive: Bool?
        ) {
            let currentTier = FreeFlowStaking.stakingTiers[tierName]
                ?? panic("Tier not found")
            
            let updatedTier = StakingTier(
                lockPeriod: lockPeriod ?? currentTier.lockPeriod,
                rewardRate: rewardRate ?? currentTier.rewardRate,
                minStakeAmount: minStakeAmount ?? currentTier.minStakeAmount,
                maxStakeAmount: maxStakeAmount ?? currentTier.maxStakeAmount,
                isActive: isActive ?? currentTier.isActive
            )
            
            FreeFlowStaking.stakingTiers[tierName] = updatedTier
        }
        
        // Add new staking tier
        pub fun addStakingTier(
            tierName: String,
            lockPeriod: UFix64,
            rewardRate: UFix64,
            minStakeAmount: UFix64,
            maxStakeAmount: UFix64
        ) {
            pre {
                !FreeFlowStaking.stakingTiers.containsKey(tierName): "Tier already exists"
                lockPeriod > 0.0: "Lock period must be positive"
                rewardRate >= 0.0: "Reward rate must be non-negative"
                minStakeAmount > 0.0: "Minimum stake must be positive"
                maxStakeAmount >= minStakeAmount: "Maximum stake must be >= minimum stake"
            }
            
            let newTier = StakingTier(
                lockPeriod: lockPeriod,
                rewardRate: rewardRate,
                minStakeAmount: minStakeAmount,
                maxStakeAmount: maxStakeAmount,
                isActive: true
            )
            
            FreeFlowStaking.stakingTiers[tierName] = newTier
        }
        
        // Pause/unpause staking
        pub fun setPauseStatus(paused: Bool) {
            FreeFlowStaking.isPaused = paused
        }
        
        // Mint reward tokens (admin function for funding rewards)
        pub fun mintRewardTokens(amount: UFix64) {
            pre {
                amount > 0.0: "Amount must be positive"
            }
            
            // This would typically interact with the FreeFlowToken admin
            // For now, we'll assume the admin has the capability to mint tokens
            // In a real implementation, this would call FreeFlowToken.getAdmin().mintTokens()
        }
    }
    
    // Storage
    pub var pool: @StakingPool
    
    // Public Functions
    pub fun getStakingTier(tierName: String): &StakingTier? {
        return &FreeFlowStaking.stakingTiers[tierName]
    }
    
    pub fun getAllStakingTiers(): {String: StakingTier} {
        return FreeFlowStaking.stakingTiers
    }
    
    pub fun getPosition(positionID: UInt64): &StakingPosition? {
        return FreeFlowStaking.pool.getPosition(id: positionID)
    }
    
    pub fun getPositionsByOwner(owner: Address): [&StakingPosition] {
        return FreeFlowStaking.pool.getPositionsByOwner(owner: owner)
    }
    
    pub fun getPoolStats(): {String: UFix64} {
        return FreeFlowStaking.pool.getPoolStats()
    }
    
    pub fun getTotalStaked(): UFix64 {
        return FreeFlowStaking.totalStaked
    }
    
    pub fun getTotalRewardsDistributed(): UFix64 {
        return FreeFlowStaking.totalRewardsDistributed
    }
    
    pub fun isStakingPaused(): Bool {
        return FreeFlowStaking.isPaused
    }
    
    // Initialize the contract
    init() {
        self.name = "Free Flow Staking"
        self.description = "Staking contract for FFT tokens with time-locked rewards"
        self.version = "1.0.0"
        self.totalStaked = 0.0
        self.totalRewardsDistributed = 0.0
        self.isPaused = false
        
        // Initialize staking tiers
        self.stakingTiers = {
            "30day": StakingTier(
                lockPeriod: 2592000.0, // 30 days in seconds
                rewardRate: 500.0, // 5% APR
                minStakeAmount: 100.0,
                maxStakeAmount: 10000.0,
                isActive: true
            ),
            "90day": StakingTier(
                lockPeriod: 7776000.0, // 90 days in seconds
                rewardRate: 800.0, // 8% APR
                minStakeAmount: 100.0,
                maxStakeAmount: 50000.0,
                isActive: true
            ),
            "180day": StakingTier(
                lockPeriod: 15552000.0, // 180 days in seconds
                rewardRate: 1200.0, // 12% APR
                minStakeAmount: 100.0,
                maxStakeAmount: 100000.0,
                isActive: true
            ),
            "365day": StakingTier(
                lockPeriod: 31536000.0, // 365 days in seconds
                rewardRate: 1800.0, // 18% APR
                minStakeAmount: 100.0,
                maxStakeAmount: 500000.0,
                isActive: true
            )
        }
        
        // Initialize staking pool
        self.pool <- create StakingPool()
        
        // Store the admin resource
        self.account.save(<-create Admin(), to: /storage/FreeFlowStakingAdmin)
        
        // Set up the admin capability
        self.account.link<&Admin>(/public/FreeFlowStakingAdmin, target: /storage/FreeFlowStakingAdmin)
    }
    
    // Get admin reference
    pub fun getAdmin(): &Admin {
        return self.account.getCapability<&Admin>(/public/FreeFlowStakingAdmin)
            .borrow() ?? panic("Admin capability not found")
    }
}
