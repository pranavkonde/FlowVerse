import FreeFlowStaking from 0x02

/// Script to get current reward rates for different staking tiers
access(all) fun main(tierName: String?): {String: AnyStruct} {
    
    if tierName != nil {
        // Get specific tier information
        let tier = FreeFlowStaking.getStakingTier(tierName: tierName!)
        
        if tier == nil {
            return {
                "error": "Tier not found: ".concat(tierName!)
            }
        }
        
        return {
            "tier": {
                "name": tierName!,
                "lockPeriod": tier!.lockPeriod,
                "lockPeriodDays": tier!.lockPeriod / 86400.0, // Convert to days
                "rewardRate": tier!.rewardRate,
                "annualPercentageRate": tier!.rewardRate / 100.0, // Convert to percentage
                "minStakeAmount": tier!.minStakeAmount,
                "maxStakeAmount": tier!.maxStakeAmount,
                "isActive": tier!.isActive
            }
        }
    } else {
        // Get all tiers information
        let allTiers = FreeFlowStaking.getAllStakingTiers()
        
        var tiersInfo: [AnyStruct] = []
        
        for tierName in allTiers.keys {
            let tier = allTiers[tierName]!
            
            let tierInfo: {String: AnyStruct} = {
                "name": tierName,
                "lockPeriod": tier.lockPeriod,
                "lockPeriodDays": tier.lockPeriod / 86400.0, // Convert to days
                "rewardRate": tier.rewardRate,
                "annualPercentageRate": tier.rewardRate / 100.0, // Convert to percentage
                "minStakeAmount": tier.minStakeAmount,
                "maxStakeAmount": tier.maxStakeAmount,
                "isActive": tier.isActive
            }
            
            tiersInfo.append(tierInfo)
        }
        
        return {
            "tiers": tiersInfo,
            "totalTiers": tiersInfo.length
        }
    }
}
