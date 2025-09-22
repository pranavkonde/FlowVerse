import FungibleToken from 0x9a0766d93b6608b7
import FreeFlowToken from 0x01

/// FreeFlowGovernance - A governance contract for community-driven protocol decisions
/// This contract allows token holders to create proposals, vote, and execute governance decisions
pub contract FreeFlowGovernance {
    
    // Governance Information
    pub let name: String
    pub let description: String
    pub let version: String
    
    // Governance Parameters
    pub let proposalThreshold: UFix64 // Minimum tokens required to create a proposal
    pub let quorumThreshold: UFix64 // Minimum percentage of total supply required for quorum
    pub let votingPeriod: UFix64 // Voting period in seconds
    pub let executionDelay: UFix64 // Delay before proposal can be executed (in seconds)
    pub let supportThreshold: UFix64 // Minimum percentage of votes required for approval
    
    // Proposal States
    pub enum ProposalState: UInt8 {
        pub case Pending // Proposal created but not yet active
        pub case Active // Proposal is active for voting
        pub case Succeeded // Proposal passed but not yet executed
        pub case Executed // Proposal has been executed
        pub case Defeated // Proposal failed to meet requirements
        pub case Expired // Proposal expired without execution
        pub case Cancelled // Proposal was cancelled
    }
    
    // Vote Types
    pub enum VoteType: UInt8 {
        pub case Against // Vote against the proposal
        pub case For // Vote for the proposal
        pub case Abstain // Abstain from voting
    }
    
    // Proposal Resource
    pub resource Proposal {
        pub let id: UInt64
        pub let proposer: Address
        pub let title: String
        pub let description: String
        pub let targets: [Address] // Addresses that will be called if proposal passes
        pub let values: [UFix64] // Values to be sent with each call
        pub let calldatas: [String] // Calldata for each call
        pub let createdAt: UFix64
        pub let startTime: UFix64
        pub let endTime: UFix64
        pub let executionTime: UFix64?
        pub var state: ProposalState
        pub var forVotes: UFix64
        pub var againstVotes: UFix64
        pub var abstainVotes: UFix64
        pub var totalVotes: UFix64
        pub var voters: {Address: Bool} // Track who has voted
        
        init(
            id: UInt64,
            proposer: Address,
            title: String,
            description: String,
            targets: [Address],
            values: [UFix64],
            calldatas: [String]
        ) {
            self.id = id
            self.proposer = proposer
            self.title = title
            self.description = description
            self.targets = targets
            self.values = values
            self.calldatas = calldatas
            self.createdAt = getCurrentBlock().timestamp
            self.startTime = getCurrentBlock().timestamp
            self.endTime = getCurrentBlock().timestamp + FreeFlowGovernance.votingPeriod
            self.executionTime = nil
            self.state = ProposalState.Pending
            self.forVotes = 0.0
            self.againstVotes = 0.0
            self.abstainVotes = 0.0
            self.totalVotes = 0.0
            self.voters = {}
        }
        
        // Activate the proposal
        pub fun activate() {
            pre {
                self.state == ProposalState.Pending: "Proposal is not in pending state"
            }
            self.state = ProposalState.Active
        }
        
        // Cast a vote
        pub fun castVote(voter: Address, voteType: VoteType, votingPower: UFix64) {
            pre {
                self.state == ProposalState.Active: "Proposal is not active for voting"
                getCurrentBlock().timestamp >= self.startTime: "Voting has not started"
                getCurrentBlock().timestamp <= self.endTime: "Voting period has ended"
                !self.voters.containsKey(voter): "Voter has already voted"
                votingPower > 0.0: "Voting power must be positive"
            }
            
            self.voters[voter] = true
            
            switch voteType {
                case VoteType.For:
                    self.forVotes = self.forVotes + votingPower
                case VoteType.Against:
                    self.againstVotes = self.againstVotes + votingPower
                case VoteType.Abstain:
                    self.abstainVotes = self.abstainVotes + votingPower
            }
            
            self.totalVotes = self.totalVotes + votingPower
        }
        
        // Check if proposal has succeeded
        pub fun checkSucceeded(): Bool {
            if self.state != ProposalState.Active {
                return false
            }
            
            if getCurrentBlock().timestamp <= self.endTime {
                return false
            }
            
            // Check if quorum is met
            let totalSupply = FreeFlowGovernance.getTotalTokenSupply()
            let quorumRequired = totalSupply * FreeFlowGovernance.quorumThreshold / 10000.0
            
            if self.totalVotes < quorumRequired {
                self.state = ProposalState.Defeated
                return false
            }
            
            // Check if support threshold is met
            let supportRequired = self.totalVotes * FreeFlowGovernance.supportThreshold / 10000.0
            
            if self.forVotes >= supportRequired {
                self.state = ProposalState.Succeeded
                self.executionTime = getCurrentBlock().timestamp + FreeFlowGovernance.executionDelay
                return true
            } else {
                self.state = ProposalState.Defeated
                return false
            }
        }
        
        // Execute the proposal
        pub fun execute() {
            pre {
                self.state == ProposalState.Succeeded: "Proposal has not succeeded"
                self.executionTime != nil: "Execution time not set"
                getCurrentBlock().timestamp >= self.executionTime!: "Execution delay has not passed"
            }
            
            self.state = ProposalState.Executed
            
            // In a real implementation, this would execute the proposal actions
            // For now, we'll just log the execution
            log("Proposal ".concat(self.id.toString()).concat(" executed successfully"))
        }
        
        // Cancel the proposal
        pub fun cancel() {
            pre {
                self.state == ProposalState.Pending || self.state == ProposalState.Active: "Proposal cannot be cancelled"
            }
            self.state = ProposalState.Cancelled
        }
        
        // Check if proposal is expired
        pub fun checkExpired(): Bool {
            if self.state == ProposalState.Succeeded {
                if let executionTime = self.executionTime {
                    if getCurrentBlock().timestamp > executionTime + 604800.0 { // 7 days grace period
                        self.state = ProposalState.Expired
                        return true
                    }
                }
            }
            return false
        }
        
        // Get proposal summary
        pub fun getSummary(): {String: AnyStruct} {
            return {
                "id": self.id,
                "proposer": self.proposer,
                "title": self.title,
                "description": self.description,
                "state": self.state,
                "forVotes": self.forVotes,
                "againstVotes": self.againstVotes,
                "abstainVotes": self.abstainVotes,
                "totalVotes": self.totalVotes,
                "createdAt": self.createdAt,
                "startTime": self.startTime,
                "endTime": self.endTime,
                "executionTime": self.executionTime,
                "voterCount": self.voters.length
            }
        }
    }
    
    // Voting Power Resource
    pub resource VotingPower {
        pub let owner: Address
        pub var delegatedTo: Address?
        pub var delegatedFrom: [Address]
        pub var lastUpdated: UFix64
        
        init(owner: Address) {
            self.owner = owner
            self.delegatedTo = nil
            self.delegatedFrom = []
            self.lastUpdated = getCurrentBlock().timestamp
        }
        
        // Delegate voting power to another address
        pub fun delegate(to: Address) {
            pre {
                to != self.owner: "Cannot delegate to self"
            }
            
            // Remove from previous delegation if any
            if let previousDelegate = self.delegatedTo {
                let previousDelegatePower = FreeFlowGovernance.getVotingPower(previousDelegate)
                previousDelegatePower.delegatedFrom.removeAll(where: { address in address == self.owner })
            }
            
            // Add to new delegation
            self.delegatedTo = to
            let newDelegatePower = FreeFlowGovernance.getVotingPower(to)
            newDelegatePower.delegatedFrom.append(self.owner)
            
            self.lastUpdated = getCurrentBlock().timestamp
        }
        
        // Undelegate voting power
        pub fun undelegate() {
            if let delegate = self.delegatedTo {
                let delegatePower = FreeFlowGovernance.getVotingPower(delegate)
                delegatePower.delegatedFrom.removeAll(where: { address in address == self.owner })
                self.delegatedTo = nil
                self.lastUpdated = getCurrentBlock().timestamp
            }
        }
        
        // Get effective voting power (own tokens + delegated tokens)
        pub fun getEffectiveVotingPower(): UFix64 {
            let ownTokens = FreeFlowGovernance.getTokenBalance(self.owner)
            var delegatedTokens: UFix64 = 0.0
            
            for delegator in self.delegatedFrom {
                delegatedTokens = delegatedTokens + FreeFlowGovernance.getTokenBalance(delegator)
            }
            
            return ownTokens + delegatedTokens
        }
    }
    
    // Governance Storage
    pub var proposals: {UInt64: Proposal}
    pub var nextProposalID: UInt64
    pub var votingPowers: {Address: VotingPower}
    
    // Admin Resource
    pub resource Admin {
        
        // Create a new proposal
        pub fun createProposal(
            proposer: Address,
            title: String,
            description: String,
            targets: [Address],
            values: [UFix64],
            calldatas: [String]
        ): UInt64 {
            pre {
                !FreeFlowGovernance.isGovernancePaused(): "Governance is paused"
                title.length > 0: "Title cannot be empty"
                description.length > 0: "Description cannot be empty"
                targets.length == values.length: "Targets and values length mismatch"
                targets.length == calldatas.length: "Targets and calldatas length mismatch"
            }
            
            // Check if proposer has enough tokens
            let proposerBalance = FreeFlowGovernance.getTokenBalance(proposer)
            pre {
                proposerBalance >= FreeFlowGovernance.proposalThreshold: "Insufficient tokens to create proposal"
            }
            
            let proposalID = FreeFlowGovernance.nextProposalID
            FreeFlowGovernance.nextProposalID = FreeFlowGovernance.nextProposalID + 1
            
            let proposal = Proposal(
                id: proposalID,
                proposer: proposer,
                title: title,
                description: description,
                targets: targets,
                values: values,
                calldatas: calldatas
            )
            
            FreeFlowGovernance.proposals[proposalID] = proposal
            
            return proposalID
        }
        
        // Activate a proposal
        pub fun activateProposal(proposalID: UInt64) {
            let proposal = FreeFlowGovernance.proposals[proposalID]
                ?? panic("Proposal not found")
            
            proposal.activate()
        }
        
        // Cast a vote on a proposal
        pub fun castVote(
            proposalID: UInt64,
            voter: Address,
            voteType: VoteType
        ) {
            let proposal = FreeFlowGovernance.proposals[proposalID]
                ?? panic("Proposal not found")
            
            let votingPower = FreeFlowGovernance.getVotingPower(voter).getEffectiveVotingPower()
            
            proposal.castVote(voter: voter, voteType: voteType, votingPower: votingPower)
        }
        
        // Execute a proposal
        pub fun executeProposal(proposalID: UInt64) {
            let proposal = FreeFlowGovernance.proposals[proposalID]
                ?? panic("Proposal not found")
            
            proposal.execute()
        }
        
        // Cancel a proposal
        pub fun cancelProposal(proposalID: UInt64) {
            let proposal = FreeFlowGovernance.proposals[proposalID]
                ?? panic("Proposal not found")
            
            proposal.cancel()
        }
        
        // Update governance parameters
        pub fun updateGovernanceParameters(
            proposalThreshold: UFix64?,
            quorumThreshold: UFix64?,
            votingPeriod: UFix64?,
            executionDelay: UFix64?,
            supportThreshold: UFix64?
        ) {
            if proposalThreshold != nil {
                FreeFlowGovernance.proposalThreshold = proposalThreshold!
            }
            if quorumThreshold != nil {
                FreeFlowGovernance.quorumThreshold = quorumThreshold!
            }
            if votingPeriod != nil {
                FreeFlowGovernance.votingPeriod = votingPeriod!
            }
            if executionDelay != nil {
                FreeFlowGovernance.executionDelay = executionDelay!
            }
            if supportThreshold != nil {
                FreeFlowGovernance.supportThreshold = supportThreshold!
            }
        }
        
        // Pause/unpause governance
        pub fun setGovernancePause(paused: Bool) {
            FreeFlowGovernance.isPaused = paused
        }
    }
    
    // Governance pause flag
    pub var isPaused: Bool
    
    // Public Functions
    pub fun getProposal(proposalID: UInt64): &Proposal? {
        return &FreeFlowGovernance.proposals[proposalID]
    }
    
    pub fun getAllProposals(): [&Proposal] {
        var result: [&Proposal] = []
        for proposalID in FreeFlowGovernance.proposals.keys {
            result.append(&FreeFlowGovernance.proposals[proposalID]!)
        }
        return result
    }
    
    pub fun getVotingPower(owner: Address): &VotingPower {
        if !FreeFlowGovernance.votingPowers.containsKey(owner) {
            FreeFlowGovernance.votingPowers[owner] = VotingPower(owner: owner)
        }
        return &FreeFlowGovernance.votingPowers[owner]!
    }
    
    pub fun getTokenBalance(owner: Address): UFix64 {
        // This would typically interact with the FreeFlowToken contract
        // For now, we'll return a placeholder value
        // In a real implementation, this would call FreeFlowToken.getBalance(owner)
        return 1000.0 // Placeholder
    }
    
    pub fun getTotalTokenSupply(): UFix64 {
        // This would typically interact with the FreeFlowToken contract
        // For now, we'll return a placeholder value
        // In a real implementation, this would call FreeFlowToken.getTotalSupply()
        return 1000000.0 // Placeholder
    }
    
    pub fun isGovernancePaused(): Bool {
        return FreeFlowGovernance.isPaused
    }
    
    pub fun getGovernanceParameters(): {String: UFix64} {
        return {
            "proposalThreshold": FreeFlowGovernance.proposalThreshold,
            "quorumThreshold": FreeFlowGovernance.quorumThreshold,
            "votingPeriod": FreeFlowGovernance.votingPeriod,
            "executionDelay": FreeFlowGovernance.executionDelay,
            "supportThreshold": FreeFlowGovernance.supportThreshold
        }
    }
    
    // Initialize the contract
    init() {
        self.name = "Free Flow Governance"
        self.description = "Community governance system for Free Flow protocol decisions"
        self.version = "1.0.0"
        
        // Set governance parameters
        self.proposalThreshold = 10000.0 // 10,000 FFT tokens required to create proposal
        self.quorumThreshold = 1000.0 // 10% of total supply required for quorum
        self.votingPeriod = 604800.0 // 7 days voting period
        self.executionDelay = 86400.0 // 1 day execution delay
        self.supportThreshold = 5000.0 // 50% of votes required for approval
        
        self.proposals = {}
        self.nextProposalID = 1
        self.votingPowers = {}
        self.isPaused = false
        
        // Store the admin resource
        self.account.save(<-create Admin(), to: /storage/FreeFlowGovernanceAdmin)
        
        // Set up the admin capability
        self.account.link<&Admin>(/public/FreeFlowGovernanceAdmin, target: /storage/FreeFlowGovernanceAdmin)
    }
    
    // Get admin reference
    pub fun getAdmin(): &Admin {
        return self.account.getCapability<&Admin>(/public/FreeFlowGovernanceAdmin)
            .borrow() ?? panic("Admin capability not found")
    }
}
