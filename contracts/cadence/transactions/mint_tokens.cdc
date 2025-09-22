import FreeFlowToken from 0x1234567890abcdef
import FungibleToken from 0x9a0766d93b6608b7

/// Transaction to mint Free Flow Tokens
transaction(amount: UFix64, recipient: Address) {
    
    // Reference to the admin resource
    let adminRef: &FreeFlowToken.Admin
    
    // Reference to the recipient's vault
    let recipientVaultRef: &FungibleToken.Vault
    
    prepare(admin: AuthAccount, recipient: AuthAccount) {
        // Get admin reference
        self.adminRef = admin.getCapability<&FreeFlowToken.Admin>(/public/FreeFlowTokenAdmin)
            .borrow() ?? panic("Admin capability not found")
        
        // Get recipient vault reference
        self.recipientVaultRef = recipient.getCapability<&FungibleToken.Vault{FungibleToken.Receiver}>(/public/FreeFlowTokenVault)
            .borrow() ?? panic("Recipient vault not found")
    }
    
    execute {
        // Mint tokens to recipient
        self.adminRef.mintTokens(amount: amount, recipient: &self.recipientVaultRef)
        
        log("Minted " + amount.toString() + " Free Flow Tokens to " + recipient.toString())
    }
}
