import FreeFlowNFT from 0x1234567890abcdef
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

/// Script to get all NFTs in a user's collection
pub fun main(account: Address): [FreeFlowNFT.NFTData] {
    let account = getAccount(account)
    
    let collectionRef = account.getCapability<&FreeFlowNFT.Collection{NonFungibleToken.CollectionPublic}>(/public/FreeFlowNFTCollection)
        .borrow()
    
    if let collection = collectionRef {
        let nftIDs = collection.getIDs()
        var nftData: [FreeFlowNFT.NFTData] = []
        
        for id in nftIDs {
            if let nft = collection.getNFT(id: id) {
                let nftRef = nft as! &FreeFlowNFT.NFT
                nftData.append(FreeFlowNFT.NFTData(
                    id: nftRef.id,
                    name: nftRef.name,
                    description: nftRef.description,
                    image: nftRef.image,
                    rarity: nftRef.rarity,
                    category: nftRef.category,
                    stats: nftRef.stats,
                    attributes: nftRef.attributes,
                    createdAt: nftRef.createdAt,
                    creator: nftRef.creator
                ))
            }
        }
        
        return nftData
    }
    
    return []
}

/// NFT Data structure for easy access
pub struct NFTData {
    pub let id: UInt64
    pub let name: String
    pub let description: String
    pub let image: String
    pub let rarity: String
    pub let category: String
    pub let stats: {String: Int}
    pub let attributes: {String: String}
    pub let createdAt: UFix64
    pub let creator: Address
    
    init(
        id: UInt64,
        name: String,
        description: String,
        image: String,
        rarity: String,
        category: String,
        stats: {String: Int},
        attributes: {String: String},
        createdAt: UFix64,
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
        self.createdAt = createdAt
        self.creator = creator
    }
}
