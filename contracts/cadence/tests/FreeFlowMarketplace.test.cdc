import FreeFlowMarketplace from 0x1234567890abcdef
import FreeFlowNFT from 0x1234567890abcdef
import FreeFlowToken from 0x1234567890abcdef
import NonFungibleToken from 0x631e88ae7f1d7c20
import FungibleToken from 0x9a0766d93b6608b7
import Test from 0x1234567890abcdef

/// Test suite for FreeFlowMarketplace contract
pub fun testFreeFlowMarketplace() {
    let testAccount = Test.createAccount()
    
    // Test contract initialization
    Test.assertEqual(FreeFlowMarketplace.name, "Free Flow Marketplace")
    Test.assertEqual(FreeFlowMarketplace.description, "Official marketplace for Free Flow game NFTs and tokens")
    Test.assertEqual(FreeFlowMarketplace.version, "1.0.0")
    Test.assertEqual(FreeFlowMarketplace.tradingFee, 250.0) // 2.5%
    Test.assertEqual(FreeFlowMarketplace.feeRecipient, 0x1234567890abcdef)
    
    // Test admin operations
    let admin = FreeFlowMarketplace.getAdmin()
    
    // Test listing creation
    let listingID = admin.createListing(
        seller: testAccount.address,
        nftID: 1,
        nftType: Type<@FreeFlowNFT.NFT>(),
        price: 100.0,
        currency: "FFT",
        expiresAt: nil
    )
    
    Test.assertEqual(listingID, 1)
    Test.assertEqual(FreeFlowMarketplace.nextListingID, 2)
    
    // Test listing retrieval
    let listing = FreeFlowMarketplace.getListing(listingID: 1)
    Test.assertNotNil(listing)
    Test.assertEqual(listing?.seller, testAccount.address)
    Test.assertEqual(listing?.nftID, 1)
    Test.assertEqual(listing?.price, 100.0)
    Test.assertEqual(listing?.currency, "FFT")
    Test.assertEqual(listing?.isActive, true)
    
    // Test offer creation
    let offerID = admin.createOffer(
        buyer: testAccount.address,
        listingID: 1,
        offerPrice: 90.0,
        currency: "FFT",
        expiresAt: nil
    )
    
    Test.assertEqual(offerID, 1)
    Test.assertEqual(FreeFlowMarketplace.nextOfferID, 2)
    
    // Test offer retrieval
    let offer = FreeFlowMarketplace.getOffer(offerID: 1)
    Test.assertNotNil(offer)
    Test.assertEqual(offer?.buyer, testAccount.address)
    Test.assertEqual(offer?.listingID, 1)
    Test.assertEqual(offer?.offerPrice, 90.0)
    Test.assertEqual(offer?.currency, "FFT")
    Test.assertEqual(offer?.isActive, true)
    
    // Test listing cancellation
    admin.cancelListing(listingID: 1)
    let cancelledListing = FreeFlowMarketplace.getListing(listingID: 1)
    Test.assertEqual(cancelledListing?.isActive, false)
    
    // Test offer cancellation
    admin.cancelOffer(offerID: 1)
    let cancelledOffer = FreeFlowMarketplace.getOffer(offerID: 1)
    Test.assertEqual(cancelledOffer?.isActive, false)
}

/// Test marketplace operations
pub fun testMarketplaceOperations() {
    let admin = FreeFlowMarketplace.getAdmin()
    
    // Create multiple listings
    let listing1 = admin.createListing(
        seller: 0x1111111111111111,
        nftID: 1,
        nftType: Type<@FreeFlowNFT.NFT>(),
        price: 100.0,
        currency: "FFT",
        expiresAt: nil
    )
    
    let listing2 = admin.createListing(
        seller: 0x2222222222222222,
        nftID: 2,
        nftType: Type<@FreeFlowNFT.NFT>(),
        price: 200.0,
        currency: "FFT",
        expiresAt: nil
    )
    
    // Test getting all listings
    let allListings = FreeFlowMarketplace.getAllListings()
    Test.assertEqual(allListings.length, 2)
    
    // Test getting all offers
    let allOffers = FreeFlowMarketplace.getAllOffers()
    Test.assertEqual(allOffers.length, 0)
    
    // Test getting all trade history
    let allTrades = FreeFlowMarketplace.getAllTradeHistory()
    Test.assertEqual(allTrades.length, 0)
}

/// Test listing expiration
pub fun testListingExpiration() {
    let admin = FreeFlowMarketplace.getAdmin()
    
    // Create listing with expiration
    let listingID = admin.createListing(
        seller: 0x1111111111111111,
        nftID: 1,
        nftType: Type<@FreeFlowNFT.NFT>(),
        price: 100.0,
        currency: "FFT",
        expiresAt: 1000.0 // Expires at timestamp 1000
    )
    
    let listing = FreeFlowMarketplace.getListing(listingID: listingID)
    Test.assertNotNil(listing)
    Test.assertEqual(listing?.isExpired(), false)
    
    // Test expiration check
    // Note: In a real test, you would need to mock the current block timestamp
    // For now, we'll test the expiration logic
    Test.assertEqual(listing?.expiresAt, 1000.0)
}

/// Test admin configuration
pub fun testAdminConfiguration() {
    let admin = FreeFlowMarketplace.getAdmin()
    
    // Test trading fee update
    admin.updateTradingFee(500.0) // 5%
    Test.assertEqual(FreeFlowMarketplace.tradingFee, 500.0)
    
    // Test fee validation
    Test.expectFailure(
        fun() {
            admin.updateTradingFee(1500.0) // 15% - should fail
        },
        "Trading fee cannot exceed 10%"
    )
    
    // Test fee recipient update
    admin.updateFeeRecipient(0x9999999999999999)
    Test.assertEqual(FreeFlowMarketplace.feeRecipient, 0x9999999999999999)
}

/// Test trade execution
pub fun testTradeExecution() {
    let admin = FreeFlowMarketplace.getAdmin()
    
    // Create listing
    let listingID = admin.createListing(
        seller: 0x1111111111111111,
        nftID: 1,
        nftType: Type<@FreeFlowNFT.NFT>(),
        price: 100.0,
        currency: "FFT",
        expiresAt: nil
    )
    
    // Create mock NFT and payment
    let nft <- create FreeFlowNFT.NFT(
        id: 1,
        name: "Test NFT",
        description: "A test NFT",
        image: "https://example.com/nft.png",
        rarity: "common",
        category: "weapon",
        stats: {"damage": 10},
        attributes: {"color": "blue"},
        creator: 0x1111111111111111
    )
    
    let payment <- create FreeFlowToken.Vault(balance: 100.0)
    
    // Execute trade
    let feePayment <- admin.executeTrade(
        listingID: listingID,
        buyer: 0x2222222222222222,
        nft: <-nft,
        payment: <-payment
    )
    
    // Verify trade was recorded
    let tradeHistory = FreeFlowMarketplace.getAllTradeHistory()
    Test.assertEqual(tradeHistory.length, 1)
    
    let trade = tradeHistory[0]
    Test.assertEqual(trade.buyer, 0x2222222222222222)
    Test.assertEqual(trade.seller, 0x1111111111111111)
    Test.assertEqual(trade.nftID, 1)
    Test.assertEqual(trade.price, 100.0)
    Test.assertEqual(trade.currency, "FFT")
    Test.assertEqual(trade.fee, 2.5) // 2.5% of 100.0
    
    // Verify listing was deactivated
    let listing = FreeFlowMarketplace.getListing(listingID: listingID)
    Test.assertEqual(listing?.isActive, false)
    
    destroy feePayment
}
