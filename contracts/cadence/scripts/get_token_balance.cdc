import FreeFlowToken from 0x1234567890abcdef
import FungibleToken from 0x9a0766d93b6608b7

/// Script to get the Free Flow Token balance of an account
pub fun main(account: Address): UFix64? {
    let account = getAccount(account)
    
    let vaultRef = account.getCapability<&FreeFlowToken.Vault{FungibleToken.Balance}>(/public/FreeFlowTokenVault)
        .borrow()
    
    if let vault = vaultRef {
        return vault.getBalance()
    }
    
    return nil
}
