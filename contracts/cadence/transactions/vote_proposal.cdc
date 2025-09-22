import FreeFlowGovernance from 0x03

/// Transaction to vote on a governance proposal
transaction(proposalID: UInt64, voteType: UInt8) {
    
    // Reference to the governance admin
    let governanceAdmin: &FreeFlowGovernance.Admin
    
    prepare(acct: AuthAccount) {
        // Get the governance admin reference
        self.governanceAdmin = FreeFlowGovernance.getAdmin()
    }
    
    execute {
        // Convert vote type
        let vote: FreeFlowGovernance.VoteType
        switch voteType {
            case 0:
                vote = FreeFlowGovernance.VoteType.Against
            case 1:
                vote = FreeFlowGovernance.VoteType.For
            case 2:
                vote = FreeFlowGovernance.VoteType.Abstain
            default:
                panic("Invalid vote type. Use 0 for Against, 1 for For, 2 for Abstain")
        }
        
        // Cast the vote
        self.governanceAdmin.castVote(
            proposalID: proposalID,
            voter: acct.address,
            voteType: vote
        )
        
        let voteString = vote == FreeFlowGovernance.VoteType.For ? "For" : 
                        vote == FreeFlowGovernance.VoteType.Against ? "Against" : "Abstain"
        
        log("Successfully voted ".concat(voteString).concat(" on proposal ").concat(proposalID.toString()))
    }
}
