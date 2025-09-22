import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

/// FreeFlowMarketplace - A marketplace for trading NFTs and tokens
/// This contract handles all trading operations in the Free Flow game
pub contract FreeFlowMarketplace {
    
    // Marketplace Information
    pub let name: String
    pub let description: String
    pub let version: String
    
    // Trading Fee (in basis points, e.g., 250 = 2.5%)
    pub let tradingFee: UFix64
    
    // Fee recipient
    pub let feeRecipient: Address
    
    // Listing Resource
    pub resource Listing {
        pub let id: UInt64
        pub let seller: Address
        pub let nftID: UInt64
        pub let nftType: Type
        pub let price: UFix64
        pub let currency: String
        pub let createdAt: UFix64
        pub let expiresAt: UFix64?
        pub let isActive: Bool
        
        init(
            id: UInt64,
            seller: Address,
            nftID: UInt64,
            nftType: Type,
            price: UFix64,
            currency: String,
            expiresAt: UFix64?
        ) {
            self.id = id
            self.seller = seller
            self.nftID = nftID
            self.nftType = nftType
            self.price = price
            self.currency = currency
            self.createdAt = getCurrentBlock().timestamp
            self.expiresAt = expiresAt
            self.isActive = true
        }
        
        // Cancel the listing
        pub fun cancel() {
            self.isActive = false
        }
        
        // Check if listing is expired
        pub fun isExpired(): Bool {
            if let expiresAt = self.expiresAt {
                return getCurrentBlock().timestamp >= expiresAt
            }
            return false
        }
    }
    
    // Offer Resource
    pub resource Offer {
        pub let id: UInt64
        pub let buyer: Address
        pub let listingID: UInt64
        pub let offerPrice: UFix64
        pub let currency: String
        pub let createdAt: UFix64
        pub let expiresAt: UFix64?
        pub let isActive: Bool
        
        init(
            id: UInt64,
            buyer: Address,
            listingID: UInt64,
            offerPrice: UFix64,
            currency: String,
            expiresAt: UFix64?
        ) {
            self.id = id
            self.buyer = buyer
            self.listingID = listingID
            self.offerPrice = offerPrice
            self.currency = currency
            self.createdAt = getCurrentBlock().timestamp
            self.expiresAt = expiresAt
            self.isActive = true
        }
        
        // Cancel the offer
        pub fun cancel() {
            self.isActive = false
        }
        
        // Check if offer is expired
        pub fun isExpired(): Bool {
            if let expiresAt = self.expiresAt {
                return getCurrentBlock().timestamp >= expiresAt
            }
            return false
        }
    }
    
    // Trade History Resource
    pub resource TradeHistory {
        pub let id: UInt64
        pub let buyer: Address
        pub let seller: Address
        pub let nftID: UInt64
        pub let nftType: Type
        pub let price: UFix64
        pub let currency: String
        pub let fee: UFix64
        pub let tradedAt: UFix64
        
        init(
            id: UInt64,
            buyer: Address,
            seller: Address,
            nftID: UInt64,
            nftType: Type,
            price: UFix64,
            currency: String,
            fee: UFix64
        ) {
            self.id = id
            self.buyer = buyer
            self.seller = seller
            self.nftID = nftID
            self.nftType = nftType
            self.price = price
            self.currency = currency
            self.fee = fee
            self.tradedAt = getCurrentBlock().timestamp
        }
    }
    
    // Marketplace Storage
    pub var listings: {UInt64: Listing}
    pub var offers: {UInt64: Offer}
    pub var tradeHistory: {UInt64: TradeHistory}
    pub var nextListingID: UInt64
    pub var nextOfferID: UInt64
    pub var nextTradeID: UInt64
    
    // Admin Resource
    pub resource Admin {
        
        // Create a new listing
        pub fun createListing(
            seller: Address,
            nftID: UInt64,
            nftType: Type,
            price: UFix64,
            currency: String,
            expiresAt: UFix64?
        ): UInt64 {
            let listingID = FreeFlowMarketplace.nextListingID
            FreeFlowMarketplace.nextListingID = FreeFlowMarketplace.nextListingID + 1
            
            let listing = Listing(
                id: listingID,
                seller: seller,
                nftID: nftID,
                nftType: nftType,
                price: price,
                currency: currency,
                expiresAt: expiresAt
            )
            
            FreeFlowMarketplace.listings[listingID] = listing
            
            return listingID
        }
        
        // Create a new offer
        pub fun createOffer(
            buyer: Address,
            listingID: UInt64,
            offerPrice: UFix64,
            currency: String,
            expiresAt: UFix64?
        ): UInt64 {
            let offerID = FreeFlowMarketplace.nextOfferID
            FreeFlowMarketplace.nextOfferID = FreeFlowMarketplace.nextOfferID + 1
            
            let offer = Offer(
                id: offerID,
                buyer: buyer,
                listingID: listingID,
                offerPrice: offerPrice,
                currency: currency,
                expiresAt: expiresAt
            )
            
            FreeFlowMarketplace.offers[offerID] = offer
            
            return offerID
        }
        
        // Execute a trade
        pub fun executeTrade(
            listingID: UInt64,
            buyer: Address,
            nft: @NonFungibleToken.NFT,
            payment: @FungibleToken.Vault
        ): @FungibleToken.Vault {
            let listing = FreeFlowMarketplace.listings[listingID]
                ?? panic("Listing not found")
            
            pre {
                listing.isActive: "Listing is not active"
                !listing.isExpired(): "Listing has expired"
                listing.seller != buyer: "Cannot buy your own listing"
            }
            
            // Calculate fee
            let fee = listing.price * FreeFlowMarketplace.tradingFee / 10000.0
            let sellerAmount = listing.price - fee
            
            // Transfer payment to seller
            let sellerPayment <- create payment.getType()(balance: sellerAmount)
            let feePayment <- create payment.getType()(balance: fee)
            
            // Record trade history
            let tradeID = FreeFlowMarketplace.nextTradeID
            FreeFlowMarketplace.nextTradeID = FreeFlowMarketplace.nextTradeID + 1
            
            let trade = TradeHistory(
                id: tradeID,
                buyer: buyer,
                seller: listing.seller,
                nftID: listing.nftID,
                nftType: listing.nftType,
                price: listing.price,
                currency: listing.currency,
                fee: fee
            )
            
            FreeFlowMarketplace.tradeHistory[tradeID] = trade
            
            // Deactivate listing
            listing.cancel()
            
            // Return fee payment to admin
            return <-feePayment
        }
        
        // Cancel a listing
        pub fun cancelListing(listingID: UInt64) {
            let listing = FreeFlowMarketplace.listings[listingID]
                ?? panic("Listing not found")
            
            listing.cancel()
        }
        
        // Cancel an offer
        pub fun cancelOffer(offerID: UInt64) {
            let offer = FreeFlowMarketplace.offers[offerID]
                ?? panic("Offer not found")
            
            offer.cancel()
        }
        
        // Update trading fee
        pub fun updateTradingFee(newFee: UFix64) {
            pre {
                newFee <= 1000.0: "Trading fee cannot exceed 10%"
            }
            
            FreeFlowMarketplace.tradingFee = newFee
        }
        
        // Update fee recipient
        pub fun updateFeeRecipient(newRecipient: Address) {
            FreeFlowMarketplace.feeRecipient = newRecipient
        }
    }
    
    // Public Functions
    pub fun getListing(listingID: UInt64): &Listing? {
        return &FreeFlowMarketplace.listings[listingID]
    }
    
    pub fun getOffer(offerID: UInt64): &Offer? {
        return &FreeFlowMarketplace.offers[offerID]
    }
    
    pub fun getTradeHistory(tradeID: UInt64): &TradeHistory? {
        return &FreeFlowMarketplace.tradeHistory[tradeID]
    }
    
    pub fun getAllListings(): [&Listing] {
        var result: [&Listing] = []
        for listingID in FreeFlowMarketplace.listings.keys {
            result.append(&FreeFlowMarketplace.listings[listingID]!)
        }
        return result
    }
    
    pub fun getAllOffers(): [&Offer] {
        var result: [&Offer] = []
        for offerID in FreeFlowMarketplace.offers.keys {
            result.append(&FreeFlowMarketplace.offers[offerID]!)
        }
        return result
    }
    
    pub fun getAllTradeHistory(): [&TradeHistory] {
        var result: [&TradeHistory] = []
        for tradeID in FreeFlowMarketplace.tradeHistory.keys {
            result.append(&FreeFlowMarketplace.tradeHistory[tradeID]!)
        }
        return result
    }
    
    // Initialize the contract
    init() {
        self.name = "Free Flow Marketplace"
        self.description = "Official marketplace for Free Flow game NFTs and tokens"
        self.version = "1.0.0"
        self.tradingFee = 250.0 // 2.5%
        self.feeRecipient = self.account.address
        
        self.listings = {}
        self.offers = {}
        self.tradeHistory = {}
        self.nextListingID = 1
        self.nextOfferID = 1
        self.nextTradeID = 1
        
        // Store the admin resource
        self.account.save(<-create Admin(), to: /storage/FreeFlowMarketplaceAdmin)
        
        // Set up the admin capability
        self.account.link<&Admin>(/public/FreeFlowMarketplaceAdmin, target: /storage/FreeFlowMarketplaceAdmin)
    }
    
    // Get admin reference
    pub fun getAdmin(): &Admin {
        return self.account.getCapability<&Admin>(/public/FreeFlowMarketplaceAdmin)
            .borrow() ?? panic("Admin capability not found")
    }
}
