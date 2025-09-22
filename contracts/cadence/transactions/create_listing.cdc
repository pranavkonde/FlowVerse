import FreeFlowMarketplace from 0x1234567890abcdef
import FreeFlowNFT from 0x1234567890abcdef
import NonFungibleToken from 0x631e88ae7f1d7c20

/// Transaction to create a marketplace listing
transaction(
    nftID: UInt64,
    price: UFix64,
    currency: String,
    expiresAt: UFix64?
) {
    
    // Reference to the marketplace admin
    let marketplaceAdminRef: &FreeFlowMarketplace.Admin
    
    // Reference to the seller's NFT collection
    let sellerCollectionRef: &FreeFlowNFT.Collection
    
    // The NFT being listed
    var nft: @NonFungibleToken.NFT
    
    prepare(seller: AuthAccount) {
        // Get marketplace admin reference
        self.marketplaceAdminRef = getAccount(0x1234567890abcdef).getCapability<&FreeFlowMarketplace.Admin>(/public/FreeFlowMarketplaceAdmin)
            .borrow() ?? panic("Marketplace admin not found")
        
        // Get seller collection reference
        self.sellerCollectionRef = seller.getCapability<&FreeFlowNFT.Collection{NonFungibleToken.Provider}>(/public/FreeFlowNFTCollection)
            .borrow() ?? panic("Seller collection not found")
        
        // Withdraw the NFT
        self.nft = self.sellerCollectionRef.withdraw(withdrawID: nftID)
    }
    
    execute {
        // Create the listing
        let listingID = self.marketplaceAdminRef.createListing(
            seller: self.sellerCollectionRef.owner?.address ?? panic("Collection owner not found"),
            nftID: nftID,
            nftType: Type<@FreeFlowNFT.NFT>(),
            price: price,
            currency: currency,
            expiresAt: expiresAt
        )
        
        log("Created listing " + listingID.toString() + " for NFT " + nftID.toString() + " at price " + price.toString() + " " + currency)
    }
    
    post {
        // Verify the listing was created
        let listing = FreeFlowMarketplace.getListing(listingID: listingID)
        listing != nil: "Listing was not created"
        listing?.seller == self.sellerCollectionRef.owner?.address: "Listing seller is incorrect"
        listing?.nftID == nftID: "Listing NFT ID is incorrect"
        listing?.price == price: "Listing price is incorrect"
    }
}
