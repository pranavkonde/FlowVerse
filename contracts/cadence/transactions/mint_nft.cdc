import FreeFlowNFT from 0x1234567890abcdef
import NonFungibleToken from 0x631e88ae7f1d7c20

/// Transaction to mint a Free Flow NFT
transaction(
    name: String,
    description: String,
    image: String,
    rarity: String,
    category: String,
    stats: {String: Int},
    attributes: {String: String},
    recipient: Address
) {
    
    // Reference to the admin resource
    let adminRef: &FreeFlowNFT.Admin
    
    // Reference to the recipient's collection
    let recipientCollectionRef: &FreeFlowNFT.Collection
    
    prepare(admin: AuthAccount, recipient: AuthAccount) {
        // Get admin reference
        self.adminRef = admin.getCapability<&FreeFlowNFT.Admin>(/public/FreeFlowNFTAdmin)
            .borrow() ?? panic("Admin capability not found")
        
        // Get recipient collection reference
        self.recipientCollectionRef = recipient.getCapability<&FreeFlowNFT.Collection{NonFungibleToken.Receiver}>(/public/FreeFlowNFTCollection)
            .borrow() ?? panic("Recipient collection not found")
    }
    
    execute {
        // Mint NFT to recipient
        let nft <- self.adminRef.mintNFT(
            recipient: &self.recipientCollectionRef,
            name: name,
            description: description,
            image: image,
            rarity: rarity,
            category: category,
            stats: stats,
            attributes: attributes
        )
        
        log("Minted NFT: " + name + " to " + recipient.toString())
    }
}
