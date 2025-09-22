import FreeFlowStaking from 0x02

/// Script to get overall staking pool statistics
access(all) fun main(): {String: AnyStruct} {
    
    // Get pool statistics
    let poolStats = FreeFlowStaking.getPoolStats()
    
    // Get total staked and rewards distributed
    let totalStaked = FreeFlowStaking.getTotalStaked()
    let totalRewardsDistributed = FreeFlowStaking.getTotalRewardsDistributed()
    
    // Get all staking tiers
    let stakingTiers = FreeFlowStaking.getAllStakingTiers()
    
    // Get pause status
    let isPaused = FreeFlowStaking.isStakingPaused()
    
    // Calculate additional metrics
    let totalPositions = poolStats["totalPositions"] as! UFix64
    let activePositions = poolStats["activePositions"] as! UFix64
    let totalPendingRewards = poolStats["totalPendingRewards"] as! UFix64
    
    // Calculate average stake amount
    let averageStakeAmount = totalPositions > 0.0 ? totalStaked / totalPositions : 0.0
    
    // Calculate average pending rewards per position
    let averagePendingRewards = activePositions > 0.0 ? totalPendingRewards / activePositions : 0.0
    
    return {
        "poolOverview": {
            "totalStaked": totalStaked,
            "totalRewardsDistributed": totalRewardsDistributed,
            "totalPendingRewards": totalPendingRewards,
            "totalPositions": totalPositions,
            "activePositions": activePositions,
            "averageStakeAmount": averageStakeAmount,
            "averagePendingRewards": averagePendingRewards,
            "isPaused": isPaused
        },
        "stakingTiers": stakingTiers,
        "timestamp": getCurrentBlock().timestamp
    }
}
