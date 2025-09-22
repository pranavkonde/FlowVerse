import FungibleToken from 0x9a0766d93b6608b7
import MetadataViews from 0x631e88ae7f1d7c20
import NonFungibleToken from 0x631e88ae7f1d7c20

/// FreeFlowToken - A fungible token for the Free Flow game
/// This token can be used for in-game transactions, trading, and rewards
pub contract FreeFlowToken: FungibleToken, MetadataViews.Resolver {
    
    // Token Information
    pub let name: String
    pub let symbol: String
    pub let decimals: UInt8
    pub let description: String
    pub let thumbnail: String
    pub let externalURL: String
    
    // Total Supply
    pub var totalSupply: UFix64
    
    // Vault Resource
    pub resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance, MetadataViews.Resolver {
        
        // Stores the amount of tokens owned by this vault
        pub var balance: UFix64
        
        // Initialize the vault with a starting balance
        init(balance: UFix64) {
            self.balance = balance
        }
        
        // Provider implementation
        pub fun withdraw(amount: UFix64): @FungibleToken.Vault {
            pre {
                amount > 0.0: "Withdrawal amount must be positive"
                amount <= self.balance: "Insufficient balance"
            }
            
            self.balance = self.balance - amount
            
            return <-create Vault(balance: amount)
        }
        
        // Receiver implementation
        pub fun deposit(from: @FungibleToken.Vault) {
            let vault = from as! @Vault
            self.balance = self.balance + vault.balance
            destroy vault
        }
        
        // Balance implementation
        pub fun getBalance(): UFix64 {
            return self.balance
        }
        
        // Destroy empty vault
        destroy() {
            pre {
                self.balance == 0.0: "Cannot destroy vault with remaining balance"
            }
        }
        
        // MetadataViews implementation
        pub fun getType(): Type {
            return Type<@FreeFlowToken.Vault>()
        }
        
        pub fun getViews(): [Type] {
            return [Type<MetadataViews.FungibleTokenMetadata>()]
        }
        
        pub fun viewResolver(key: String): AnyStruct? {
            switch key {
                case MetadataViews.FungibleTokenMetadata.getIdentifier():
                    return MetadataViews.FungibleTokenMetadata(
                        vault: self,
                        name: FreeFlowToken.name,
                        symbol: FreeFlowToken.symbol,
                        decimals: FreeFlowToken.decimals,
                        logo: FreeFlowToken.thumbnail,
                        descriptions: FreeFlowToken.description,
                        externalURL: FreeFlowToken.externalURL,
                        socials: {"Twitter": "https://twitter.com/freeflowgame", "Discord": "https://discord.gg/freeflow"},
                        tags: ["game", "defi", "flow", "nft"],
                        collectionIdentifiers: [],
                        collectionData: {},
                        media: {}
                    )
                default:
                    return nil
            }
        }
    }
    
    // Admin Resource for minting and burning
    pub resource Admin {
        
        // Mint new tokens
        pub fun mintTokens(amount: UFix64, recipient: &FungibleToken.Vault) {
            pre {
                amount > 0.0: "Mint amount must be positive"
            }
            
            FreeFlowToken.totalSupply = FreeFlowToken.totalSupply + amount
            
            let vault <- create Vault(balance: amount)
            recipient.deposit(from: <-vault)
        }
        
        // Burn tokens
        pub fun burnTokens(amount: UFix64, from: &FungibleToken.Vault) {
            pre {
                amount > 0.0: "Burn amount must be positive"
            }
            
            let vault <- from.withdraw(amount: amount)
            FreeFlowToken.totalSupply = FreeFlowToken.totalSupply - amount
            destroy vault
        }
        
        // Update metadata
        pub fun updateMetadata(
            name: String?,
            symbol: String?,
            description: String?,
            thumbnail: String?,
            externalURL: String?
        ) {
            if name != nil {
                FreeFlowToken.name = name!
            }
            if symbol != nil {
                FreeFlowToken.symbol = symbol!
            }
            if description != nil {
                FreeFlowToken.description = description!
            }
            if thumbnail != nil {
                FreeFlowToken.thumbnail = thumbnail!
            }
            if externalURL != nil {
                FreeFlowToken.externalURL = externalURL!
            }
        }
    }
    
    // Public Functions
    pub fun createEmptyVault(): @FungibleToken.Vault {
        return <-create Vault(balance: 0.0)
    }
    
    // Initialize the contract
    init() {
        self.name = "Free Flow Token"
        self.symbol = "FFT"
        self.decimals = 8
        self.description = "The official token of Free Flow - a 2D multiplayer virtual environment on Flow blockchain"
        self.thumbnail = "https://freeflow.game/logo.png"
        self.externalURL = "https://freeflow.game"
        self.totalSupply = 0.0
        
        // Store the admin resource
        self.account.save(<-create Admin(), to: /storage/FreeFlowTokenAdmin)
        
        // Set up the admin capability
        self.account.link<&Admin>(/public/FreeFlowTokenAdmin, target: /storage/FreeFlowTokenAdmin)
    }
    
    // Get admin reference
    pub fun getAdmin(): &Admin {
        return self.account.getCapability<&Admin>(/public/FreeFlowTokenAdmin)
            .borrow() ?? panic("Admin capability not found")
    }
}
