# Free Flow Cadence Smart Contracts

This directory contains the Cadence smart contracts for the Free Flow game on the Flow blockchain.

## Contract Overview

### Core Contracts

1. **FreeFlowToken.cdc** - Fungible token contract for in-game currency
2. **FreeFlowNFT.cdc** - Non-fungible token contract for in-game items
3. **FreeFlowMarketplace.cdc** - Trading marketplace for NFTs and tokens

### Scripts

- **get_token_balance.cdc** - Query token balances
- **get_nft_collection.cdc** - Retrieve user NFT collections
- **get_marketplace_listings.cdc** - Fetch active marketplace listings

### Transactions

- **mint_tokens.cdc** - Mint Free Flow Tokens
- **mint_nft.cdc** - Mint NFTs with custom attributes
- **create_listing.cdc** - Create marketplace listings
- **execute_trade.cdc** - Execute trades on the marketplace
- **setup_account.cdc** - Initialize user accounts

### Tests

- **FreeFlowToken.test.cdc** - Comprehensive token contract tests
- **FreeFlowNFT.test.cdc** - NFT contract tests
- **FreeFlowMarketplace.test.cdc** - Marketplace contract tests

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

## Contract Addresses

- **Testnet**: TBD
- **Mainnet**: TBD

## Dependencies

- FungibleToken: 0x9a0766d93b6608b7
- NonFungibleToken: 0x631e88ae7f1d7c20
- MetadataViews: 0x631e88ae7f1d7c20

## License

This project is licensed under the MIT License.
