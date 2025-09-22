import FreeFlowMarketplace from 0x1234567890abcdef

/// Script to get all active marketplace listings
pub fun main(): [FreeFlowMarketplace.ListingData] {
    let marketplace = getAccount(0x1234567890abcdef).getContract<&FreeFlowMarketplace.FreeFlowMarketplace>(name: "FreeFlowMarketplace")
        ?? panic("Marketplace contract not found")
    
    let listings = marketplace.getAllListings()
    var listingData: [FreeFlowMarketplace.ListingData] = []
    
    for listing in listings {
        if listing.isActive && !listing.isExpired() {
            listingData.append(FreeFlowMarketplace.ListingData(
                id: listing.id,
                seller: listing.seller,
                nftID: listing.nftID,
                nftType: listing.nftType,
                price: listing.price,
                currency: listing.currency,
                createdAt: listing.createdAt,
                expiresAt: listing.expiresAt
            ))
        }
    }
    
    return listingData
}

/// Listing Data structure for easy access
pub struct ListingData {
    pub let id: UInt64
    pub let seller: Address
    pub let nftID: UInt64
    pub let nftType: Type
    pub let price: UFix64
    pub let currency: String
    pub let createdAt: UFix64
    pub let expiresAt: UFix64?
    
    init(
        id: UInt64,
        seller: Address,
        nftID: UInt64,
        nftType: Type,
        price: UFix64,
        currency: String,
        createdAt: UFix64,
        expiresAt: UFix64?
    ) {
        self.id = id
        self.seller = seller
        self.nftID = nftID
        self.nftType = nftType
        self.price = price
        self.currency = currency
        self.createdAt = createdAt
        self.expiresAt = expiresAt
    }
}
