import FreeFlowGovernance from 0x03

/// Script to get voting power information for a specific address
access(all) fun main(owner: Address): {String: AnyStruct} {
    
    // Get voting power resource
    let votingPower = FreeFlowGovernance.getVotingPower(owner)
    
    // Get token balance
    let tokenBalance = FreeFlowGovernance.getTokenBalance(owner)
    
    // Get effective voting power (including delegations)
    let effectiveVotingPower = votingPower.getEffectiveVotingPower()
    
    // Get delegation information
    let delegatedTo = votingPower.delegatedTo
    let delegatedFrom = votingPower.delegatedFrom
    let delegatedFromCount = votingPower.delegatedFrom.length
    
    // Calculate delegated amount
    var delegatedAmount: UFix64 = 0.0
    for delegator in votingPower.delegatedFrom {
        delegatedAmount = delegatedAmount + FreeFlowGovernance.getTokenBalance(delegator)
    }
    
    // Get governance parameters
    let governanceParams = FreeFlowGovernance.getGovernanceParameters()
    let proposalThreshold = governanceParams["proposalThreshold"]!
    let canCreateProposal = tokenBalance >= proposalThreshold
    
    // Get total supply for percentage calculations
    let totalSupply = FreeFlowGovernance.getTotalTokenSupply()
    let votingPowerPercentage = totalSupply > 0.0 ? (effectiveVotingPower * 10000.0 / totalSupply) / 100.0 : 0.0
    let tokenBalancePercentage = totalSupply > 0.0 ? (tokenBalance * 10000.0 / totalSupply) / 100.0 : 0.0
    
    return {
        "owner": owner,
        "votingPower": {
            "ownTokens": tokenBalance,
            "delegatedTokens": delegatedAmount,
            "effectiveVotingPower": effectiveVotingPower,
            "votingPowerPercentage": votingPowerPercentage,
            "tokenBalancePercentage": tokenBalancePercentage
        },
        "delegation": {
            "delegatedTo": delegatedTo,
            "delegatedFrom": delegatedFrom,
            "delegatedFromCount": delegatedFromCount,
            "isDelegated": delegatedTo != nil,
            "hasDelegators": delegatedFromCount > 0
        },
        "proposalEligibility": {
            "canCreateProposal": canCreateProposal,
            "proposalThreshold": proposalThreshold,
            "tokensNeeded": canCreateProposal ? 0.0 : proposalThreshold - tokenBalance
        },
        "lastUpdated": votingPower.lastUpdated
    }
}
