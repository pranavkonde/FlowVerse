import FreeFlowMarketplace from 0x1234567890abcdef
import FreeFlowNFT from 0x1234567890abcdef
import FreeFlowToken from 0x1234567890abcdef
import NonFungibleToken from 0x631e88ae7f1d7c20
import FungibleToken from 0x9a0766d93b6608b7

/// Transaction to execute a trade on the marketplace
transaction(listingID: UInt64, paymentAmount: UFix64) {
    
    // Reference to the marketplace admin
    let marketplaceAdminRef: &FreeFlowMarketplace.Admin
    
    // Reference to the buyer's NFT collection
    let buyerCollectionRef: &FreeFlowNFT.Collection
    
    // Reference to the buyer's token vault
    let buyerVaultRef: &FreeFlowToken.Vault
    
    // Reference to the seller's token vault
    let sellerVaultRef: &FreeFlowToken.Vault
    
    // The payment vault
    var payment: @FungibleToken.Vault
    
    // The NFT being traded
    var nft: @NonFungibleToken.NFT
    
    prepare(buyer: AuthAccount, seller: AuthAccount) {
        // Get marketplace admin reference
        self.marketplaceAdminRef = getAccount(0x1234567890abcdef).getCapability<&FreeFlowMarketplace.Admin>(/public/FreeFlowMarketplaceAdmin)
            .borrow() ?? panic("Marketplace admin not found")
        
        // Get buyer collection reference
        self.buyerCollectionRef = buyer.getCapability<&FreeFlowNFT.Collection{NonFungibleToken.Receiver}>(/public/FreeFlowNFTCollection)
            .borrow() ?? panic("Buyer collection not found")
        
        // Get buyer vault reference
        self.buyerVaultRef = buyer.getCapability<&FreeFlowToken.Vault{FungibleToken.Provider}>(/public/FreeFlowTokenVault)
            .borrow() ?? panic("Buyer vault not found")
        
        // Get seller vault reference
        self.sellerVaultRef = seller.getCapability<&FreeFlowToken.Vault{FungibleToken.Receiver}>(/public/FreeFlowTokenVault)
            .borrow() ?? panic("Seller vault not found")
        
        // Withdraw payment
        self.payment = self.buyerVaultRef.withdraw(amount: paymentAmount)
        
        // Get the NFT from the marketplace (this would be handled by the marketplace contract)
        // For now, we'll assume the NFT is available
        self.nft = create FreeFlowNFT.NFT(
            id: 1,
            name: "Test NFT",
            description: "A test NFT",
            image: "https://example.com/image.png",
            rarity: "common",
            category: "weapon",
            stats: {"damage": 10},
            attributes: {"color": "blue"},
            creator: seller.address
        )
    }
    
    execute {
        // Execute the trade
        let feePayment <- self.marketplaceAdminRef.executeTrade(
            listingID: listingID,
            buyer: self.buyerCollectionRef.owner?.address ?? panic("Collection owner not found"),
            nft: <-self.nft,
            payment: <-self.payment
        )
        
        // Deposit NFT to buyer
        self.buyerCollectionRef.deposit(token: <-self.nft)
        
        // Deposit payment to seller
        self.sellerVaultRef.deposit(from: <-self.payment)
        
        log("Executed trade for listing " + listingID.toString() + " with payment " + paymentAmount.toString())
    }
    
    post {
        // Verify the trade was executed
        let listing = FreeFlowMarketplace.getListing(listingID: listingID)
        listing?.isActive == false: "Listing should be inactive after trade"
    }
}
