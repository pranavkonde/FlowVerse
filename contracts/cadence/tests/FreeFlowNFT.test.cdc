import FreeFlowNFT from 0x1234567890abcdef
import NonFungibleToken from 0x631e88ae7f1d7c20
import Test from 0x1234567890abcdef

/// Test suite for FreeFlowNFT contract
pub fun testFreeFlowNFT() {
    let testAccount = Test.createAccount()
    
    // Test contract initialization
    Test.assertEqual(FreeFlowNFT.name, "Free Flow NFT Collection")
    Test.assertEqual(FreeFlowNFT.symbol, "FFNFT")
    Test.assertEqual(FreeFlowNFT.totalSupply, 0)
    
    // Test collection creation
    let collection <- FreeFlowNFT.createEmptyCollection()
    Test.assertEqual(collection.getLength(), 0)
    Test.assertEqual(collection.getIDs(), [])
    
    // Test NFT minting
    let admin = FreeFlowNFT.getAdmin()
    let nft <- admin.mintNFT(
        recipient: &collection,
        name: "Test Sword",
        description: "A powerful sword",
        image: "https://example.com/sword.png",
        rarity: "rare",
        category: "weapon",
        stats: {"damage": 50, "durability": 100},
        attributes: {"color": "blue", "material": "steel"}
    )
    
    Test.assertEqual(FreeFlowNFT.totalSupply, 1)
    Test.assertEqual(collection.getLength(), 1)
    Test.assertEqual(collection.getIDs(), [1])
    
    // Test NFT retrieval
    let retrievedNFT = collection.getNFT(id: 1)
    Test.assertNotNil(retrievedNFT)
    
    // Test NFT withdrawal
    let withdrawnNFT <- collection.withdraw(withdrawID: 1)
    Test.assertEqual(collection.getLength(), 0)
    Test.assertEqual(collection.getIDs(), [])
    
    // Test NFT deposit
    collection.deposit(token: <-withdrawnNFT)
    Test.assertEqual(collection.getLength(), 1)
    Test.assertEqual(collection.getIDs(), [1])
    
    destroy collection
}

/// Test NFT metadata
pub fun testNFTMetadata() {
    let collection <- FreeFlowNFT.createEmptyCollection()
    let admin = FreeFlowNFT.getAdmin()
    
    // Mint NFT with specific metadata
    let nft <- admin.mintNFT(
        recipient: &collection,
        name: "Legendary Armor",
        description: "Armor of the ancients",
        image: "https://example.com/armor.png",
        rarity: "legendary",
        category: "armor",
        stats: {"defense": 100, "magic_resistance": 50},
        attributes: {"color": "gold", "material": "mithril", "enchantment": "divine"}
    )
    
    // Test NFT properties
    let nftRef = nft as! &FreeFlowNFT.NFT
    Test.assertEqual(nftRef.name, "Legendary Armor")
    Test.assertEqual(nftRef.description, "Armor of the ancients")
    Test.assertEqual(nftRef.rarity, "legendary")
    Test.assertEqual(nftRef.category, "armor")
    Test.assertEqual(nftRef.stats["defense"], 100)
    Test.assertEqual(nftRef.stats["magic_resistance"], 50)
    Test.assertEqual(nftRef.attributes["color"], "gold")
    Test.assertEqual(nftRef.attributes["material"], "mithril")
    Test.assertEqual(nftRef.attributes["enchantment"], "divine")
    
    destroy collection
}

/// Test batch minting
pub fun testBatchMinting() {
    let collection <- FreeFlowNFT.createEmptyCollection()
    let admin = FreeFlowNFT.getAdmin()
    
    // Prepare batch mint data
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
            name: "Health Potion",
            description: "Restores 100 HP",
            image: "https://example.com/potion.png",
            rarity: "common",
            category: "consumable",
            stats: {"healing": 100},
            attributes: {"type": "potion", "color": "red"}
        },
        {
            name: "Magic Ring",
            description: "Increases mana regeneration",
            image: "https://example.com/ring.png",
            rarity: "epic",
            category: "accessory",
            stats: {"mana_regen": 25},
            attributes: {"type": "ring", "color": "purple"}
        }
    ]
    
    // Test batch minting
    let mintedNFTs = admin.batchMintNFTs(recipient: &collection, nfts: nftData)
    
    Test.assertEqual(FreeFlowNFT.totalSupply, 2)
    Test.assertEqual(collection.getLength(), 2)
    Test.assertEqual(collection.getIDs(), [1, 2])
    Test.assertEqual(mintedNFTs.length, 2)
    
    // Test individual NFTs
    let nft1 = collection.getNFT(id: 1) as! &FreeFlowNFT.NFT
    let nft2 = collection.getNFT(id: 2) as! &FreeFlowNFT.NFT
    
    Test.assertEqual(nft1.name, "Health Potion")
    Test.assertEqual(nft1.rarity, "common")
    Test.assertEqual(nft1.category, "consumable")
    
    Test.assertEqual(nft2.name, "Magic Ring")
    Test.assertEqual(nft2.rarity, "epic")
    Test.assertEqual(nft2.category, "accessory")
    
    destroy collection
}

/// Test collection operations
pub fun testCollectionOperations() {
    let collection <- FreeFlowNFT.createEmptyCollection()
    let admin = FreeFlowNFT.getAdmin()
    
    // Test empty collection
    Test.assertEqual(collection.getLength(), 0)
    Test.assertEqual(collection.getIDs(), [])
    Test.assertNil(collection.getNFT(id: 1))
    
    // Mint NFT
    let nft <- admin.mintNFT(
        recipient: &collection,
        name: "Test Item",
        description: "A test item",
        image: "https://example.com/item.png",
        rarity: "common",
        category: "misc",
        stats: {},
        attributes: {}
    )
    
    // Test collection with NFT
    Test.assertEqual(collection.getLength(), 1)
    Test.assertEqual(collection.getIDs(), [1])
    Test.assertNotNil(collection.getNFT(id: 1))
    
    // Test withdrawal validation
    Test.expectFailure(
        fun() {
            collection.withdraw(withdrawID: 999)
        },
        "NFT not found in collection"
    )
    
    destroy collection
}
