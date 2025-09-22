import FreeFlowToken from 0x1234567890abcdef
import FreeFlowNFT from 0x1234567890abcdef
import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20

/// Transaction to set up an account for Free Flow
/// This creates the necessary vaults and collections
transaction() {
    
    // Reference to the account being set up
    let account: AuthAccount
    
    prepare(account: AuthAccount) {
        self.account = account
        
        // Create and store Free Flow Token vault
        let tokenVault <- FreeFlowToken.createEmptyVault()
        self.account.save(<-tokenVault, to: /storage/FreeFlowTokenVault)
        
        // Create and store Free Flow NFT collection
        let nftCollection <- FreeFlowNFT.createEmptyCollection()
        self.account.save(<-nftCollection, to: /storage/FreeFlowNFTCollection)
        
        // Link public capabilities
        self.account.link<&FreeFlowToken.Vault{FungibleToken.Balance, FungibleToken.Receiver}>(/public/FreeFlowTokenVault, target: /storage/FreeFlowTokenVault)
        self.account.link<&FreeFlowNFT.Collection{NonFungibleToken.CollectionPublic}>(/public/FreeFlowNFTCollection, target: /storage/FreeFlowNFTCollection)
        
        log("Account set up successfully for Free Flow")
    }
    
    execute {
        // Account setup is complete
        log("Free Flow account setup completed")
    }
}
