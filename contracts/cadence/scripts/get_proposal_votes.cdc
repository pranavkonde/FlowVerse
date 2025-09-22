import FreeFlowGovernance from 0x03

/// Script to get voting results and statistics for a specific proposal
access(all) fun main(proposalID: UInt64): {String: AnyStruct} {
    
    let proposal = FreeFlowGovernance.getProposal(proposalID: proposalID)
    
    if proposal == nil {
        return {
            "error": "Proposal not found: ".concat(proposalID.toString())
        }
    }
    
    // Get basic vote counts
    let forVotes = proposal!.forVotes
    let againstVotes = proposal!.againstVotes
    let abstainVotes = proposal!.abstainVotes
    let totalVotes = proposal!.totalVotes
    let voterCount = proposal!.voters.length
    
    // Calculate vote percentages
    let forPercentage = totalVotes > 0.0 ? (forVotes * 10000.0 / totalVotes) / 100.0 : 0.0
    let againstPercentage = totalVotes > 0.0 ? (againstVotes * 10000.0 / totalVotes) / 100.0 : 0.0
    let abstainPercentage = totalVotes > 0.0 ? (abstainVotes * 10000.0 / totalVotes) / 100.0 : 0.0
    
    // Get governance parameters
    let governanceParams = FreeFlowGovernance.getGovernanceParameters()
    let totalSupply = FreeFlowGovernance.getTotalTokenSupply()
    let quorumThreshold = governanceParams["quorumThreshold"]!
    let supportThreshold = governanceParams["supportThreshold"]!
    
    // Calculate quorum metrics
    let quorumRequired = totalSupply * quorumThreshold / 10000.0
    let quorumMet = totalVotes >= quorumRequired
    let quorumPercentage = totalSupply > 0.0 ? (totalVotes * 10000.0 / quorumRequired) / 100.0 : 0.0
    
    // Calculate support metrics
    let supportRequired = totalVotes * supportThreshold / 10000.0
    let supportMet = forVotes >= supportRequired
    let supportPercentage = totalVotes > 0.0 ? (forVotes * 10000.0 / supportRequired) / 100.0 : 0.0
    
    // Determine proposal outcome
    let currentTime = getCurrentBlock().timestamp
    let votingEnded = currentTime > proposal!.endTime
    let isExecutable = proposal!.state == FreeFlowGovernance.ProposalState.Succeeded && 
                      proposal!.executionTime != nil && 
                      currentTime >= proposal!.executionTime!
    
    // Calculate participation metrics
    let participationRate = totalSupply > 0.0 ? (totalVotes * 10000.0 / totalSupply) / 100.0 : 0.0
    let averageVoteSize = voterCount > 0 ? totalVotes / UFix64(voterCount) : 0.0
    
    return {
        "proposalID": proposalID,
        "voteCounts": {
            "forVotes": forVotes,
            "againstVotes": againstVotes,
            "abstainVotes": abstainVotes,
            "totalVotes": totalVotes,
            "voterCount": voterCount
        },
        "votePercentages": {
            "forPercentage": forPercentage,
            "againstPercentage": againstPercentage,
            "abstainPercentage": abstainPercentage
        },
        "quorumMetrics": {
            "quorumRequired": quorumRequired,
            "quorumMet": quorumMet,
            "quorumPercentage": quorumPercentage,
            "quorumThreshold": quorumThreshold
        },
        "supportMetrics": {
            "supportRequired": supportRequired,
            "supportMet": supportMet,
            "supportPercentage": supportPercentage,
            "supportThreshold": supportThreshold
        },
        "participationMetrics": {
            "participationRate": participationRate,
            "averageVoteSize": averageVoteSize,
            "totalSupply": totalSupply
        },
        "proposalStatus": {
            "state": proposal!.state,
            "votingEnded": votingEnded,
            "isExecutable": isExecutable,
            "currentTime": currentTime,
            "endTime": proposal!.endTime,
            "executionTime": proposal!.executionTime
        }
    }
}
