import FreeFlowGovernance from 0x03

/// Transaction to delegate voting power to another address
transaction(delegateTo: Address?) {
    
    prepare(acct: AuthAccount) {
        // Get the voter's voting power resource
        let votingPower = FreeFlowGovernance.getVotingPower(acct.address)
        
        if delegateTo != nil {
            // Delegate to the specified address
            votingPower.delegate(to: delegateTo!)
            log("Successfully delegated voting power to ".concat(delegateTo!.toString()))
        } else {
            // Undelegate (delegate to self)
            votingPower.undelegate()
            log("Successfully undelegated voting power")
        }
    }
    
    execute {
        // Transaction logic is handled in prepare block
    }
}
