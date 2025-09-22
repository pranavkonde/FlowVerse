import Test
import FreeFlowGovernance from 0x03

/// Comprehensive test suite for FreeFlowGovernance contract
access(all) fun main() {
    
    let test = Test.newTest()
    
    // Test account setup
    let admin = test.createAccount()
    let proposer = test.createAccount()
    let voter1 = test.createAccount()
    let voter2 = test.createAccount()
    let voter3 = test.createAccount()
    
    // Deploy contract
    test.deployContract(
        name: "FreeFlowGovernance",
        path: "../contracts/FreeFlowGovernance.cdc",
        arguments: []
    )
    
    // Setup accounts
    test.setupAccount(admin)
    test.setupAccount(proposer)
    test.setupAccount(voter1)
    test.setupAccount(voter2)
    test.setupAccount(voter3)
    
    // Run tests
    test.run("testGovernanceParameters", testGovernanceParameters)
    test.run("testCreateProposal", testCreateProposal)
    test.run("testVotingMechanism", testVotingMechanism)
    test.run("testProposalExecution", testProposalExecution)
    test.run("testVotingPower", testVotingPower)
    test.run("testDelegation", testDelegation)
    test.run("testProposalStates", testProposalStates)
    test.run("testSecurityFeatures", testSecurityFeatures)
    
    test.cleanup(admin)
    test.cleanup(proposer)
    test.cleanup(voter1)
    test.cleanup(voter2)
    test.cleanup(voter3)
}

/// Test governance parameters
access(all) fun testGovernanceParameters(test: Test) {
    let params = FreeFlowGovernance.getGovernanceParameters()
    
    test.assertEqual(
        params["proposalThreshold"],
        10000.0,
        message: "Proposal threshold should be 10,000 tokens"
    )
    
    test.assertEqual(
        params["quorumThreshold"],
        1000.0,
        message: "Quorum threshold should be 10%"
    )
    
    test.assertEqual(
        params["votingPeriod"],
        604800.0,
        message: "Voting period should be 7 days"
    )
    
    test.assertEqual(
        params["executionDelay"],
        86400.0,
        message: "Execution delay should be 1 day"
    )
    
    test.assertEqual(
        params["supportThreshold"],
        5000.0,
        message: "Support threshold should be 50%"
    )
}

/// Test proposal creation
access(all) fun testCreateProposal(test: Test) {
    let proposer = test.getAccount(0x02) // proposer
    
    // Mock token balance for proposer
    // In a real test, this would be set up through the token contract
    
    let governanceAdmin = FreeFlowGovernance.getAdmin()
    
    // Create a proposal
    let proposalID = governanceAdmin.createProposal(
        proposer: proposer.address,
        title: "Test Proposal",
        description: "This is a test proposal for governance testing",
        targets: [proposer.address],
        values: [0.0],
        calldatas: ["test_calldata"]
    )
    
    test.assertEqual(proposalID, 1, message: "First proposal should have ID 1")
    
    // Activate the proposal
    governanceAdmin.activateProposal(proposalID: proposalID)
    
    // Verify proposal was created
    let proposal = FreeFlowGovernance.getProposal(proposalID: proposalID)
    test.assertNotEqual(proposal, nil, message: "Proposal should exist")
    test.assertEqual(proposal?.title, "Test Proposal", message: "Proposal title should match")
    test.assertEqual(proposal?.proposer, proposer.address, message: "Proposer should match")
    test.assertEqual(proposal?.state, FreeFlowGovernance.ProposalState.Active, message: "Proposal should be active")
}

/// Test voting mechanism
access(all) fun testVotingMechanism(test: Test) {
    let voter1 = test.getAccount(0x03) // voter1
    let voter2 = test.getAccount(0x04) // voter2
    
    // Get existing proposal
    let proposal = FreeFlowGovernance.getProposal(proposalID: 1)
    test.assertNotEqual(proposal, nil, message: "Proposal should exist")
    
    let governanceAdmin = FreeFlowGovernance.getAdmin()
    
    // Vote for the proposal
    governanceAdmin.castVote(
        proposalID: 1,
        voter: voter1.address,
        voteType: FreeFlowGovernance.VoteType.For
    )
    
    // Vote against the proposal
    governanceAdmin.castVote(
        proposalID: 1,
        voter: voter2.address,
        voteType: FreeFlowGovernance.VoteType.Against
    )
    
    // Verify votes were recorded
    test.assertGreater(proposal!.forVotes, 0.0, message: "Should have for votes")
    test.assertGreater(proposal!.againstVotes, 0.0, message: "Should have against votes")
    test.assertEqual(proposal!.totalVotes, proposal!.forVotes + proposal!.againstVotes, message: "Total votes should equal sum")
    
    // Test abstain vote
    let voter3 = test.getAccount(0x05) // voter3
    governanceAdmin.castVote(
        proposalID: 1,
        voter: voter3.address,
        voteType: FreeFlowGovernance.VoteType.Abstain
    )
    
    test.assertGreater(proposal!.abstainVotes, 0.0, message: "Should have abstain votes")
}

/// Test proposal execution
access(all) fun testProposalExecution(test: Test) {
    let proposal = FreeFlowGovernance.getProposal(proposalID: 1)
    test.assertNotEqual(proposal, nil, message: "Proposal should exist")
    
    // Fast forward time to end voting period
    test.advanceTime(by: 604800.0) // 7 days
    
    // Check if proposal succeeded
    let succeeded = proposal!.checkSucceeded()
    
    if succeeded {
        test.assertEqual(proposal!.state, FreeFlowGovernance.ProposalState.Succeeded, message: "Proposal should be succeeded")
        
        // Fast forward time for execution delay
        test.advanceTime(by: 86400.0) // 1 day
        
        // Execute the proposal
        let governanceAdmin = FreeFlowGovernance.getAdmin()
        governanceAdmin.executeProposal(proposalID: 1)
        
        test.assertEqual(proposal!.state, FreeFlowGovernance.ProposalState.Executed, message: "Proposal should be executed")
    }
}

/// Test voting power functionality
access(all) fun testVotingPower(test: Test) {
    let voter = test.getAccount(0x03) // voter1
    
    // Get voting power
    let votingPower = FreeFlowGovernance.getVotingPower(voter.address)
    
    test.assertEqual(votingPower.owner, voter.address, message: "Voting power owner should match")
    test.assertEqual(votingPower.delegatedTo, nil, message: "Should not be delegated initially")
    test.assertEqual(votingPower.delegatedFrom.length, 0, message: "Should have no delegators initially")
    
    // Test effective voting power calculation
    let effectivePower = votingPower.getEffectiveVotingPower()
    test.assertGreaterEqual(effectivePower, 0.0, message: "Effective voting power should be non-negative")
}

/// Test delegation functionality
access(all) fun testDelegation(test: Test) {
    let delegator = test.getAccount(0x03) // voter1
    let delegate = test.getAccount(0x04) // voter2
    
    // Get voting powers
    let delegatorPower = FreeFlowGovernance.getVotingPower(delegator.address)
    let delegatePower = FreeFlowGovernance.getVotingPower(delegate.address)
    
    // Delegate voting power
    delegatorPower.delegate(to: delegate.address)
    
    test.assertEqual(delegatorPower.delegatedTo, delegate.address, message: "Should be delegated to correct address")
    test.assertEqual(delegatePower.delegatedFrom.length, 1, message: "Delegate should have one delegator")
    test.assertTrue(delegatePower.delegatedFrom.contains(delegator.address), message: "Delegate should have delegator in list")
    
    // Test effective voting power after delegation
    let delegateEffectivePower = delegatePower.getEffectiveVotingPower()
    let delegatorEffectivePower = delegatorPower.getEffectiveVotingPower()
    
    test.assertGreater(delegateEffectivePower, 0.0, message: "Delegate should have increased voting power")
    
    // Undelegate
    delegatorPower.undelegate()
    
    test.assertEqual(delegatorPower.delegatedTo, nil, message: "Should not be delegated after undelegation")
    test.assertEqual(delegatePower.delegatedFrom.length, 0, message: "Delegate should have no delegators after undelegation")
}

/// Test proposal states
access(all) fun testProposalStates(test: Test) {
    let proposer = test.getAccount(0x02) // proposer
    let governanceAdmin = FreeFlowGovernance.getAdmin()
    
    // Create a new proposal
    let proposalID = governanceAdmin.createProposal(
        proposer: proposer.address,
        title: "State Test Proposal",
        description: "Testing proposal states",
        targets: [proposer.address],
        values: [0.0],
        calldatas: ["test"]
    )
    
    let proposal = FreeFlowGovernance.getProposal(proposalID: proposalID)
    test.assertNotEqual(proposal, nil, message: "Proposal should exist")
    
    // Test initial state
    test.assertEqual(proposal!.state, FreeFlowGovernance.ProposalState.Pending, message: "Should start in pending state")
    
    // Activate proposal
    governanceAdmin.activateProposal(proposalID: proposalID)
    test.assertEqual(proposal!.state, FreeFlowGovernance.ProposalState.Active, message: "Should be active after activation")
    
    // Test cancellation
    governanceAdmin.cancelProposal(proposalID: proposalID)
    test.assertEqual(proposal!.state, FreeFlowGovernance.ProposalState.Cancelled, message: "Should be cancelled")
}

/// Test security features
access(all) fun testSecurityFeatures(test: Test) {
    let proposer = test.getAccount(0x02) // proposer
    let governanceAdmin = FreeFlowGovernance.getAdmin()
    
    // Test creating proposal with empty title
    test.expectFailure(
        message: "Should fail with empty title"
    ) {
        governanceAdmin.createProposal(
            proposer: proposer.address,
            title: "",
            description: "Test",
            targets: [proposer.address],
            values: [0.0],
            calldatas: ["test"]
        )
    }
    
    // Test creating proposal with empty description
    test.expectFailure(
        message: "Should fail with empty description"
    ) {
        governanceAdmin.createProposal(
            proposer: proposer.address,
            title: "Test",
            description: "",
            targets: [proposer.address],
            values: [0.0],
            calldatas: ["test"]
        )
    }
    
    // Test creating proposal with mismatched arrays
    test.expectFailure(
        message: "Should fail with mismatched targets and values"
    ) {
        governanceAdmin.createProposal(
            proposer: proposer.address,
            title: "Test",
            description: "Test",
            targets: [proposer.address],
            values: [0.0, 1.0], // Mismatched length
            calldatas: ["test"]
        )
    }
    
    // Test voting on non-existent proposal
    test.expectFailure(
        message: "Should fail voting on non-existent proposal"
    ) {
        governanceAdmin.castVote(
            proposalID: 999, // Non-existent
            voter: proposer.address,
            voteType: FreeFlowGovernance.VoteType.For
        )
    }
    
    // Test executing non-existent proposal
    test.expectFailure(
        message: "Should fail executing non-existent proposal"
    ) {
        governanceAdmin.executeProposal(proposalID: 999)
    }
    
    // Test double voting
    let proposalID = governanceAdmin.createProposal(
        proposer: proposer.address,
        title: "Double Vote Test",
        description: "Testing double voting prevention",
        targets: [proposer.address],
        values: [0.0],
        calldatas: ["test"]
    )
    
    governanceAdmin.activateProposal(proposalID: proposalID)
    
    // First vote should succeed
    governanceAdmin.castVote(
        proposalID: proposalID,
        voter: proposer.address,
        voteType: FreeFlowGovernance.VoteType.For
    )
    
    // Second vote should fail
    test.expectFailure(
        message: "Should fail on double voting"
    ) {
        governanceAdmin.castVote(
            proposalID: proposalID,
            voter: proposer.address,
            voteType: FreeFlowGovernance.VoteType.Against
        )
    }
}
