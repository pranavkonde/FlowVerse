import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

/// FreeFlowNFT - Non-fungible tokens for in-game items, characters, and achievements
/// This contract manages all NFT assets in the Free Flow game
pub contract FreeFlowNFT: NonFungibleToken, MetadataViews.Resolver {
    
    // NFT Information
    pub let name: String
    pub let symbol: String
    pub let description: String
    pub let thumbnail: String
    pub let externalURL: String
    
    // Total Supply
    pub var totalSupply: UInt64
    
    // NFT Resource
    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        
        // Unique identifier
        pub let id: UInt64
        
        // NFT metadata
        pub let name: String
        pub let description: String
        pub let image: String
        pub let rarity: String
        pub let category: String
        pub let stats: {String: Int}
        pub let attributes: {String: String}
        pub let createdAt: UFix64
        pub let creator: Address
        
        // Initialize the NFT
        init(
            id: UInt64,
            name: String,
            description: String,
            image: String,
            rarity: String,
            category: String,
            stats: {String: Int},
            attributes: {String: String},
            creator: Address
        ) {
            self.id = id
            self.name = name
            self.description = description
            self.image = image
            self.rarity = rarity
            self.category = category
            self.stats = stats
            self.attributes = attributes
            self.createdAt = getCurrentBlock().timestamp
            self.creator = creator
        }
        
        // MetadataViews implementation
        pub fun getType(): Type {
            return Type<@FreeFlowNFT.NFT>()
        }
        
        pub fun getViews(): [Type] {
            return [Type<MetadataViews.NFTMetadata>()]
        }
        
        pub fun viewResolver(key: String): AnyStruct? {
            switch key {
                case MetadataViews.NFTMetadata.getIdentifier():
                    return MetadataViews.NFTMetadata(
                        nft: self,
                        name: self.name,
                        description: self.description,
                        thumbnail: self.image,
                        externalURL: FreeFlowNFT.externalURL,
                        media: {"image": self.image},
                        attributes: self.attributes,
                        collection: MetadataViews.NFTCollectionData(
                            name: FreeFlowNFT.name,
                            description: FreeFlowNFT.description,
                            externalURL: FreeFlowNFT.externalURL,
                            squareImage: FreeFlowNFT.thumbnail,
                            bannerImage: FreeFlowNFT.thumbnail,
                            socials: {"Twitter": "https://twitter.com/freeflowgame", "Discord": "https://discord.gg/freeflow"},
                            royalties: [],
                            tags: ["game", "nft", "flow", "defi"],
                            royaltiesDescription: "Free Flow NFT Collection"
                        )
                    )
                default:
                    return nil
            }
        }
    }
    
    // Collection Resource
    pub resource Collection: NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.Resolver {
        
        // Dictionary to store NFTs
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}
        
        // Initialize the collection
        init() {
            self.ownedNFTs <- {}
        }
        
        // Provider implementation
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let nft <- self.ownedNFTs.remove(key: withdrawID)
                ?? panic("NFT not found in collection")
            
            return <-nft
        }
        
        // Receiver implementation
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let nft <- token as! @NFT
            let id = nft.id
            
            self.ownedNFTs[id] <-! nft
        }
        
        // Get NFT by ID
        pub fun getNFT(id: UInt64): &NonFungibleToken.NFT? {
            return &self.ownedNFTs[id] as &NonFungibleToken.NFT?
        }
        
        // Get all NFT IDs
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }
        
        // Get NFT count
        pub fun getLength(): Int {
            return self.ownedNFTs.length
        }
        
        // Destroy empty collection
        destroy() {
            destroy self.ownedNFTs
        }
        
        // MetadataViews implementation
        pub fun getType(): Type {
            return Type<@FreeFlowNFT.Collection>()
        }
        
        pub fun getViews(): [Type] {
            return [Type<MetadataViews.NFTCollectionDisplay>()]
        }
        
        pub fun viewResolver(key: String): AnyStruct? {
            switch key {
                case MetadataViews.NFTCollectionDisplay.getIdentifier():
                    return MetadataViews.NFTCollectionDisplay(
                        name: FreeFlowNFT.name,
                        description: FreeFlowNFT.description,
                        externalURL: FreeFlowNFT.externalURL,
                        squareImage: FreeFlowNFT.thumbnail,
                        bannerImage: FreeFlowNFT.thumbnail,
                        socials: {"Twitter": "https://twitter.com/freeflowgame", "Discord": "https://discord.gg/freeflow"},
                        royalties: [],
                        tags: ["game", "nft", "flow", "defi"],
                        royaltiesDescription: "Free Flow NFT Collection"
                    )
                default:
                    return nil
            }
        }
    }
    
    // Admin Resource for minting
    pub resource Admin {
        
        // Mint new NFT
        pub fun mintNFT(
            recipient: &Collection,
            name: String,
            description: String,
            image: String,
            rarity: String,
            category: String,
            stats: {String: Int},
            attributes: {String: String}
        ): @NonFungibleToken.NFT {
            FreeFlowNFT.totalSupply = FreeFlowNFT.totalSupply + 1
            
            let nft <- create NFT(
                id: FreeFlowNFT.totalSupply,
                name: name,
                description: description,
                image: image,
                rarity: rarity,
                category: category,
                stats: stats,
                attributes: attributes,
                creator: self.account.address
            )
            
            return <-nft
        }
        
        // Batch mint NFTs
        pub fun batchMintNFTs(
            recipient: &Collection,
            nfts: [{
                name: String,
                description: String,
                image: String,
                rarity: String,
                category: String,
                stats: {String: Int},
                attributes: {String: String}
            }]
        ): [@NonFungibleToken.NFT] {
            var mintedNFTs: [@NonFungibleToken.NFT] = []
            
            for nftData in nfts {
                FreeFlowNFT.totalSupply = FreeFlowNFT.totalSupply + 1
                
                let nft <- create NFT(
                    id: FreeFlowNFT.totalSupply,
                    name: nftData.name,
                    description: nftData.description,
                    image: nftData.image,
                    rarity: nftData.rarity,
                    category: nftData.category,
                    stats: nftData.stats,
                    attributes: nftData.attributes,
                    creator: self.account.address
                )
                
                mintedNFTs.append(<-nft)
            }
            
            return mintedNFTs
        }
        
        // Update metadata
        pub fun updateMetadata(
            name: String?,
            description: String?,
            thumbnail: String?,
            externalURL: String?
        ) {
            if name != nil {
                FreeFlowNFT.name = name!
            }
            if description != nil {
                FreeFlowNFT.description = description!
            }
            if thumbnail != nil {
                FreeFlowNFT.thumbnail = thumbnail!
            }
            if externalURL != nil {
                FreeFlowNFT.externalURL = externalURL!
            }
        }
    }
    
    // Public Functions
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <-create Collection()
    }
    
    // Initialize the contract
    init() {
        self.name = "Free Flow NFT Collection"
        self.symbol = "FFNFT"
        self.description = "Official NFT collection for Free Flow game items, characters, and achievements"
        self.thumbnail = "https://freeflow.game/nft-logo.png"
        self.externalURL = "https://freeflow.game/nfts"
        self.totalSupply = 0
        
        // Store the admin resource
        self.account.save(<-create Admin(), to: /storage/FreeFlowNFTAdmin)
        
        // Set up the admin capability
        self.account.link<&Admin>(/public/FreeFlowNFTAdmin, target: /storage/FreeFlowNFTAdmin)
    }
    
    // Get admin reference
    pub fun getAdmin(): &Admin {
        return self.account.getCapability<&Admin>(/public/FreeFlowNFTAdmin)
            .borrow() ?? panic("Admin capability not found")
    }
}
