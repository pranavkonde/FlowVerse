import FreeFlowGovernance from 0x03

/// Transaction to create a new governance proposal
transaction(
    title: String,
    description: String,
    targets: [Address],
    values: [UFix64],
    calldatas: [String]
) {
    
    // Reference to the governance admin
    let governanceAdmin: &FreeFlowGovernance.Admin
    
    prepare(acct: AuthAccount) {
        // Get the governance admin reference
        self.governanceAdmin = FreeFlowGovernance.getAdmin()
    }
    
    execute {
        // Create the proposal
        let proposalID = self.governanceAdmin.createProposal(
            proposer: acct.address,
            title: title,
            description: description,
            targets: targets,
            values: values,
            calldatas: calldatas
        )
        
        // Activate the proposal
        self.governanceAdmin.activateProposal(proposalID: proposalID)
        
        log("Successfully created and activated proposal ".concat(proposalID.toString()).concat(": ").concat(title))
    }
}
