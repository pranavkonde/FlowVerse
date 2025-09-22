import FreeFlowGovernance from 0x03

/// Script to get detailed information about a specific proposal
access(all) fun main(proposalID: UInt64): {String: AnyStruct} {
    
    let proposal = FreeFlowGovernance.getProposal(proposalID: proposalID)
    
    if proposal == nil {
        return {
            "error": "Proposal not found: ".concat(proposalID.toString())
        }
    }
    
    // Get proposal summary
    let summary = proposal!.getSummary()
    
    // Calculate additional metrics
    let currentTime = getCurrentBlock().timestamp
    let timeRemaining = proposal!.endTime > currentTime ? proposal!.endTime - currentTime : 0.0
    let isVotingActive = proposal!.state == FreeFlowGovernance.ProposalState.Active && currentTime >= proposal!.startTime && currentTime <= proposal!.endTime
    
    // Calculate vote percentages
    let totalVotes = proposal!.totalVotes
    let forPercentage = totalVotes > 0.0 ? (proposal!.forVotes * 10000.0 / totalVotes) / 100.0 : 0.0
    let againstPercentage = totalVotes > 0.0 ? (proposal!.againstVotes * 10000.0 / totalVotes) / 100.0 : 0.0
    let abstainPercentage = totalVotes > 0.0 ? (proposal!.abstainVotes * 10000.0 / totalVotes) / 100.0 : 0.0
    
    // Get governance parameters for context
    let governanceParams = FreeFlowGovernance.getGovernanceParameters()
    let totalSupply = FreeFlowGovernance.getTotalTokenSupply()
    let quorumRequired = totalSupply * governanceParams["quorumThreshold"]! / 10000.0
    let quorumPercentage = (proposal!.totalVotes * 10000.0 / quorumRequired) / 100.0
    
    return {
        "proposal": summary,
        "metrics": {
            "timeRemaining": timeRemaining,
            "timeRemainingDays": timeRemaining / 86400.0,
            "isVotingActive": isVotingActive,
            "forPercentage": forPercentage,
            "againstPercentage": againstPercentage,
            "abstainPercentage": abstainPercentage,
            "quorumRequired": quorumRequired,
            "quorumPercentage": quorumPercentage,
            "quorumMet": proposal!.totalVotes >= quorumRequired
        },
        "governanceContext": {
            "totalSupply": totalSupply,
            "quorumThreshold": governanceParams["quorumThreshold"]!,
            "supportThreshold": governanceParams["supportThreshold"]!,
            "votingPeriod": governanceParams["votingPeriod"]!,
            "executionDelay": governanceParams["executionDelay"]!
        }
    }
}
