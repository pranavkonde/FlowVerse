// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FreeFlowGovernance
 * @dev Governance contract for Free Flow DAO
 * @author Free Flow Team
 */
contract FreeFlowGovernance is ReentrancyGuard, Ownable {
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool cancelled;
    }

    struct Vote {
        bool support;
        uint256 weight;
        string reason;
    }

    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => Vote)) public votes;
    mapping(address => uint256) public votingPower;
    mapping(address => bool) public isDelegate;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_DELAY = 1 days;
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant PROPOSAL_THRESHOLD = 1000 * 10**18; // 1000 tokens
    uint256 public constant QUORUM_THRESHOLD = 10000 * 10**18; // 10000 tokens

    modifier onlyDelegate() {
        require(isDelegate[msg.sender], "Not a delegate");
        _;
    }

    modifier validProposal(uint256 _proposalId) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        _;
    }

    constructor() {}

    function createProposal(
        string memory _title,
        string memory _description
    ) external onlyDelegate returns (uint256) {
        require(votingPower[msg.sender] >= PROPOSAL_THRESHOLD, "Insufficient voting power");
        
        uint256 proposalId = proposalCount;
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: _title,
            description: _description,
            startTime: block.timestamp + VOTING_DELAY,
            endTime: block.timestamp + VOTING_DELAY + VOTING_PERIOD,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            cancelled: false
        });

        proposalCount++;
        emit ProposalCreated(proposalId, msg.sender, _title);
        return proposalId;
    }

    function castVote(
        uint256 _proposalId,
        bool _support,
        string memory _reason
    ) external validProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.executed, "Proposal executed");
        require(!proposal.cancelled, "Proposal cancelled");
        require(votes[msg.sender][_proposalId].weight == 0, "Already voted");

        uint256 weight = votingPower[msg.sender];
        require(weight > 0, "No voting power");

        votes[msg.sender][_proposalId] = Vote({
            support: _support,
            weight: weight,
            reason: _reason
        });

        if (_support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit VoteCast(msg.sender, _proposalId, _support, weight);
    }

    function executeProposal(uint256 _proposalId) external validProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        require(proposal.forVotes + proposal.againstVotes >= QUORUM_THRESHOLD, "Quorum not met");

        proposal.executed = true;
        emit ProposalExecuted(_proposalId);
    }

    function cancelProposal(uint256 _proposalId) external validProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(msg.sender == proposal.proposer || msg.sender == owner(), "Not authorized");
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Already cancelled");

        proposal.cancelled = true;
        emit ProposalCancelled(_proposalId);
    }

    function setVotingPower(address _user, uint256 _power) external onlyOwner {
        votingPower[_user] = _power;
    }

    function setDelegate(address _user, bool _isDelegate) external onlyOwner {
        isDelegate[_user] = _isDelegate;
    }

    function getProposal(uint256 _proposalId) external view validProposal(_proposalId) returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool cancelled
    ) {
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.cancelled
        );
    }

    function getVote(address _voter, uint256 _proposalId) external view validProposal(_proposalId) returns (
        bool support,
        uint256 weight,
        string memory reason
    ) {
        Vote memory vote = votes[_voter][_proposalId];
        return (vote.support, vote.weight, vote.reason);
    }

    function getProposalState(uint256 _proposalId) external view validProposal(_proposalId) returns (string memory) {
        Proposal memory proposal = proposals[_proposalId];
        
        if (proposal.cancelled) return "Cancelled";
        if (proposal.executed) return "Executed";
        if (block.timestamp < proposal.startTime) return "Pending";
        if (block.timestamp <= proposal.endTime) return "Active";
        if (proposal.forVotes <= proposal.againstVotes) return "Defeated";
        if (proposal.forVotes + proposal.againstVotes < QUORUM_THRESHOLD) return "Defeated";
        return "Succeeded";
    }
}

