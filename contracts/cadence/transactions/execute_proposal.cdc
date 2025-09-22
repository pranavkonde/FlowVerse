import FreeFlowGovernance from 0x03

/// Transaction to execute a governance proposal after it has succeeded
transaction(proposalID: UInt64) {
    
    // Reference to the governance admin
    let governanceAdmin: &FreeFlowGovernance.Admin
    
    prepare(acct: AuthAccount) {
        // Get the governance admin reference
        self.governanceAdmin = FreeFlowGovernance.getAdmin()
    }
    
    execute {
        // Execute the proposal
        self.governanceAdmin.executeProposal(proposalID: proposalID)
        
        log("Successfully executed proposal ".concat(proposalID.toString()))
    }
}
