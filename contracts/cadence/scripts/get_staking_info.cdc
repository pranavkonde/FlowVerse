import FreeFlowStaking from 0x02

/// Script to get detailed staking information for a specific user
access(all) fun main(owner: Address): {String: AnyStruct} {
    
    // Get all positions for the owner
    let positions = FreeFlowStaking.getPositionsByOwner(owner: owner)
    
    var result: {String: AnyStruct} = {
        "owner": owner,
        "totalPositions": positions.length,
        "positions": []
    }
    
    var totalStaked: UFix64 = 0.0
    var totalPendingRewards: UFix64 = 0.0
    var totalClaimed: UFix64 = 0.0
    
    // Process each position
    for position in positions {
        let pendingRewards = position.calculatePendingRewards()
        let canUnstake = position.canUnstake()
        
        totalStaked = totalStaked + position.amount
        totalPendingRewards = totalPendingRewards + pendingRewards
        totalClaimed = totalClaimed + position.totalClaimed
        
        let positionInfo: {String: AnyStruct} = {
            "id": position.id,
            "tier": position.tier,
            "amount": position.amount,
            "stakedAt": position.stakedAt,
            "unlockAt": position.unlockAt,
            "rewardRate": position.rewardRate,
            "lastClaimedAt": position.lastClaimedAt,
            "totalClaimed": position.totalClaimed,
            "pendingRewards": pendingRewards,
            "canUnstake": canUnstake,
            "isActive": position.isActive,
            "timeRemaining": position.unlockAt > getCurrentBlock().timestamp ? position.unlockAt - getCurrentBlock().timestamp : 0.0
        }
        
        result["positions"] = (result["positions"] as! [AnyStruct]) + [positionInfo]
    }
    
    // Add summary information
    result["summary"] = {
        "totalStaked": totalStaked,
        "totalPendingRewards": totalPendingRewards,
        "totalClaimed": totalClaimed,
        "totalValue": totalStaked + totalPendingRewards
    }
    
    return result
}
