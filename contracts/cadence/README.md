# Free Flow Cadence Smart Contracts

This directory contains the Cadence smart contracts for the Free Flow game on the Flow blockchain.

## Contract Overview

### Core Contracts

1. **FreeFlowToken.cdc** - Fungible token contract for in-game currency
2. **FreeFlowNFT.cdc** - Non-fungible token contract for in-game items
3. **FreeFlowMarketplace.cdc** - Trading marketplace for NFTs and tokens
4. **FreeFlowStaking.cdc** - Staking contract with time-locked rewards
5. **FreeFlowGovernance.cdc** - Community governance system for protocol decisions

### Scripts

- **get_token_balance.cdc** - Query token balances
- **get_nft_collection.cdc** - Retrieve user NFT collections
- **get_marketplace_listings.cdc** - Fetch active marketplace listings
- **get_staking_info.cdc** - Get user staking positions and rewards
- **get_pool_stats.cdc** - Get overall staking pool statistics
- **get_reward_rate.cdc** - Get current reward rates for different tiers
- **get_proposal.cdc** - Get detailed proposal information
- **get_voting_power.cdc** - Get user voting power and delegation info
- **get_proposal_votes.cdc** - Get voting results and statistics

### Transactions

- **mint_tokens.cdc** - Mint Free Flow Tokens
- **mint_nft.cdc** - Mint NFTs with custom attributes
- **create_listing.cdc** - Create marketplace listings
- **execute_trade.cdc** - Execute trades on the marketplace
- **setup_account.cdc** - Initialize user accounts
- **stake_tokens.cdc** - Stake FFT tokens for rewards
- **unstake_tokens.cdc** - Unstake tokens after lock period
- **claim_rewards.cdc** - Claim accumulated staking rewards
- **emergency_unstake.cdc** - Emergency unstake with penalty
- **create_proposal.cdc** - Create governance proposals
- **vote_proposal.cdc** - Vote on governance proposals
- **execute_proposal.cdc** - Execute passed proposals
- **delegate_voting.cdc** - Delegate voting power to another address

### Tests

- **FreeFlowToken.test.cdc** - Comprehensive token contract tests
- **FreeFlowNFT.test.cdc** - NFT contract tests
- **FreeFlowMarketplace.test.cdc** - Marketplace contract tests
- **FreeFlowStaking.test.cdc** - Staking contract tests with reward calculations
- **FreeFlowGovernance.test.cdc** - Governance contract tests with voting scenarios

### Deployment

- **deploy_contracts.cdc** - Deploy all contracts
- **configure_contracts.cdc** - Configure contracts after deployment

## Features

### FreeFlowToken
- Fungible token with minting and burning capabilities
- MetadataViews integration for proper token metadata
- Admin controls for token management
- Vault system for secure token storage

### FreeFlowNFT
- Non-fungible tokens for in-game items
- Support for multiple categories (weapons, armor, accessories, etc.)
- Rarity system (common, rare, epic, legendary)
- Stats and attributes system
- Batch minting capabilities

### FreeFlowMarketplace
- Trading system for NFTs and tokens
- Listing and offer management
- Trading fee system with configurable rates
- Trade history tracking
- Expiration support for listings and offers

### FreeFlowStaking
- Time-locked staking with multiple tiers (30, 90, 180, 365 days)
- Compound interest calculation for rewards
- Emergency unstake with penalty mechanism
- Configurable reward rates and staking parameters
- Integration with FreeFlowToken for seamless operations
- Pool statistics and user position tracking

### FreeFlowGovernance
- Community-driven protocol governance
- Proposal creation and lifecycle management
- Voting system with For/Against/Abstain options
- Delegation system for voting power management
- Quorum and support threshold requirements
- Time-locked execution for security
- Proposal states: Pending, Active, Succeeded, Executed, Defeated, Expired, Cancelled

## Usage

### Deploying Contracts

1. Deploy the contracts using `deploy_contracts.cdc`
2. Configure the contracts using `configure_contracts.cdc`
3. Mint initial tokens and NFTs

### Setting Up User Accounts

Users need to run the `setup_account.cdc` transaction to:
- Create a token vault
- Create an NFT collection
- Link public capabilities

### Trading

1. Create listings using `create_listing.cdc`
2. Execute trades using `execute_trade.cdc`
3. Query listings using `get_marketplace_listings.cdc`

### Staking

1. Stake tokens using `stake_tokens.cdc` with desired tier
2. Claim rewards using `claim_rewards.cdc` without unstaking
3. Unstake tokens using `unstake_tokens.cdc` after lock period
4. Query staking info using `get_staking_info.cdc`

### Governance

1. Create proposals using `create_proposal.cdc` (requires minimum token threshold)
2. Vote on proposals using `vote_proposal.cdc`
3. Delegate voting power using `delegate_voting.cdc`
4. Execute passed proposals using `execute_proposal.cdc`
5. Query proposal details using `get_proposal.cdc`

## Testing

Run the test suite to verify contract functionality:

```bash
flow test contracts/cadence/tests/
```

## Security Considerations

- All contracts use proper resource management
- Admin functions are protected with capabilities
- Trading fees are configurable and validated
- Input validation is implemented throughout
- Staking contracts include emergency pause mechanisms
- Governance includes time-locked execution for security
- Double-voting prevention in governance system
- Access controls and permission checks throughout

## Contract Addresses

- **Testnet**: TBD
- **Mainnet**: TBD

## Dependencies

- FungibleToken: 0x9a0766d93b6608b7
- NonFungibleToken: 0x631e88ae7f1d7c20
- MetadataViews: 0x631e88ae7f1d7c20

## License

This project is licensed under the MIT License.
