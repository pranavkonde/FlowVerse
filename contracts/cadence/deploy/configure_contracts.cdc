import FreeFlowToken from 0x1234567890abcdef
import FreeFlowNFT from 0x1234567890abcdef
import FreeFlowMarketplace from 0x1234567890abcdef

/// Configuration script for Free Flow contracts
/// This script configures contracts after deployment
transaction() {
    
    // Reference to the admin account
    let admin: AuthAccount
    
    prepare(admin: AuthAccount) {
        self.admin = admin
        
        // Configure FreeFlowToken
        let tokenAdmin = FreeFlowToken.getAdmin()
        tokenAdmin.updateMetadata(
            name: "Free Flow Token",
            symbol: "FFT",
            description: "The official token of Free Flow - a 2D multiplayer virtual environment on Flow blockchain",
            thumbnail: "https://freeflow.game/logo.png",
            externalURL: "https://freeflow.game"
        )
        
        // Configure FreeFlowNFT
        let nftAdmin = FreeFlowNFT.getAdmin()
        nftAdmin.updateMetadata(
            name: "Free Flow NFT Collection",
            description: "Official NFT collection for Free Flow game items, characters, and achievements",
            thumbnail: "https://freeflow.game/nft-logo.png",
            externalURL: "https://freeflow.game/nfts"
        )
        
        // Configure FreeFlowMarketplace
        let marketplaceAdmin = FreeFlowMarketplace.getAdmin()
        marketplaceAdmin.updateTradingFee(250.0) // 2.5%
        marketplaceAdmin.updateFeeRecipient(admin.address)
        
        log("Contract configuration completed")
    }
    
    execute {
        // Post-configuration setup
        log("Free Flow contracts configuration completed")
        log("Trading fee set to 2.5%")
        log("Fee recipient set to: " + self.admin.address.toString())
    }
}

/// Initial token minting script
transaction(initialSupply: UFix64) {
    
    // Reference to the admin account
    let admin: AuthAccount
    
    // Reference to the treasury account
    let treasury: AuthAccount
    
    prepare(admin: AuthAccount, treasury: AuthAccount) {
        self.admin = admin
        self.treasury = treasury
        
        // Get admin references
        let tokenAdmin = FreeFlowToken.getAdmin()
        
        // Get treasury vault
        let treasuryVault = treasury.getCapability<&FreeFlowToken.Vault{FungibleToken.Receiver}>(/public/FreeFlowTokenVault)
            .borrow() ?? panic("Treasury vault not found")
        
        // Mint initial supply
        tokenAdmin.mintTokens(amount: initialSupply, recipient: &treasuryVault)
        
        log("Initial token supply minted: " + initialSupply.toString())
    }
    
    execute {
        log("Initial token minting completed")
    }
}

/// Initial NFT minting script
transaction() {
    
    // Reference to the admin account
    let admin: AuthAccount
    
    // Reference to the treasury account
    let treasury: AuthAccount
    
    prepare(admin: AuthAccount, treasury: AuthAccount) {
        self.admin = admin
        self.treasury = treasury
        
        // Get admin references
        let nftAdmin = FreeFlowNFT.getAdmin()
        
        // Get treasury collection
        let treasuryCollection = treasury.getCapability<&FreeFlowNFT.Collection{NonFungibleToken.Receiver}>(/public/FreeFlowNFTCollection)
            .borrow() ?? panic("Treasury collection not found")
        
        // Mint initial NFTs
        let nftData: [{
            name: String,
            description: String,
            image: String,
            rarity: String,
            category: String,
            stats: {String: Int},
            attributes: {String: String}
        }] = [
            {
                name: "Genesis Sword",
                description: "The first sword ever forged in Free Flow",
                image: "https://freeflow.game/nfts/genesis-sword.png",
                rarity: "legendary",
                category: "weapon",
                stats: {"damage": 100, "durability": 1000},
                attributes: {"color": "gold", "material": "mithril", "enchantment": "divine"}
            },
            {
                name: "Genesis Armor",
                description: "The first armor ever crafted in Free Flow",
                image: "https://freeflow.game/nfts/genesis-armor.png",
                rarity: "legendary",
                category: "armor",
                stats: {"defense": 100, "magic_resistance": 100},
                attributes: {"color": "silver", "material": "adamantine", "enchantment": "divine"}
            },
            {
                name: "Genesis Ring",
                description: "The first ring ever enchanted in Free Flow",
                image: "https://freeflow.game/nfts/genesis-ring.png",
                rarity: "legendary",
                category: "accessory",
                stats: {"mana": 100, "mana_regen": 50},
                attributes: {"color": "purple", "material": "crystal", "enchantment": "divine"}
            }
        ]
        
        // Batch mint NFTs
        let mintedNFTs = nftAdmin.batchMintNFTs(recipient: &treasuryCollection, nfts: nftData)
        
        log("Initial NFTs minted: " + mintedNFTs.length.toString())
    }
    
    execute {
        log("Initial NFT minting completed")
    }
}
