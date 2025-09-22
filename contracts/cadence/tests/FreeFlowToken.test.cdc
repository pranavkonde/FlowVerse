import FreeFlowToken from 0x1234567890abcdef
import FungibleToken from 0x9a0766d93b6608b7
import Test from 0x1234567890abcdef

/// Test suite for FreeFlowToken contract
pub fun testFreeFlowToken() {
    let testAccount = Test.createAccount()
    
    // Test contract initialization
    Test.assertEqual(FreeFlowToken.name, "Free Flow Token")
    Test.assertEqual(FreeFlowToken.symbol, "FFT")
    Test.assertEqual(FreeFlowToken.decimals, 8)
    Test.assertEqual(FreeFlowToken.totalSupply, 0.0)
    
    // Test vault creation
    let vault <- FreeFlowToken.createEmptyVault()
    Test.assertEqual(vault.getBalance(), 0.0)
    
    // Test minting
    let admin = FreeFlowToken.getAdmin()
    admin.mintTokens(amount: 1000.0, recipient: &vault)
    Test.assertEqual(vault.getBalance(), 1000.0)
    Test.assertEqual(FreeFlowToken.totalSupply, 1000.0)
    
    // Test burning
    admin.burnTokens(amount: 100.0, from: &vault)
    Test.assertEqual(vault.getBalance(), 900.0)
    Test.assertEqual(FreeFlowToken.totalSupply, 900.0)
    
    // Test withdrawal
    let withdrawnVault <- vault.withdraw(amount: 200.0)
    Test.assertEqual(withdrawnVault.getBalance(), 200.0)
    Test.assertEqual(vault.getBalance(), 700.0)
    
    // Test deposit
    vault.deposit(from: <-withdrawnVault)
    Test.assertEqual(vault.getBalance(), 900.0)
    
    // Test metadata update
    admin.updateMetadata(
        name: "Updated Free Flow Token",
        symbol: "UFFT",
        description: "Updated description",
        thumbnail: "https://updated.com/logo.png",
        externalURL: "https://updated.com"
    )
    
    Test.assertEqual(FreeFlowToken.name, "Updated Free Flow Token")
    Test.assertEqual(FreeFlowToken.symbol, "UFFT")
    
    destroy vault
}

/// Test vault operations
pub fun testVaultOperations() {
    let vault <- FreeFlowToken.createEmptyVault()
    
    // Test initial state
    Test.assertEqual(vault.getBalance(), 0.0)
    
    // Test deposit
    let depositVault <- FreeFlowToken.createEmptyVault()
    // Simulate deposit by creating a vault with balance
    let tempVault <- create FreeFlowToken.Vault(balance: 500.0)
    vault.deposit(from: <-tempVault)
    Test.assertEqual(vault.getBalance(), 500.0)
    
    // Test withdrawal
    let withdrawnVault <- vault.withdraw(amount: 200.0)
    Test.assertEqual(withdrawnVault.getBalance(), 200.0)
    Test.assertEqual(vault.getBalance(), 300.0)
    
    // Test withdrawal validation
    Test.expectFailure(
        fun() {
            vault.withdraw(amount: 400.0)
        },
        "Insufficient balance"
    )
    
    // Test deposit validation
    Test.expectFailure(
        fun() {
            vault.deposit(from: <-create FreeFlowToken.Vault(balance: 0.0))
        },
        "Cannot deposit zero amount"
    )
    
    destroy vault
    destroy withdrawnVault
}

/// Test admin operations
pub fun testAdminOperations() {
    let admin = FreeFlowToken.getAdmin()
    let vault <- FreeFlowToken.createEmptyVault()
    
    // Test minting validation
    Test.expectFailure(
        fun() {
            admin.mintTokens(amount: 0.0, recipient: &vault)
        },
        "Mint amount must be positive"
    )
    
    // Test burning validation
    Test.expectFailure(
        fun() {
            admin.burnTokens(amount: 0.0, from: &vault)
        },
        "Burn amount must be positive"
    )
    
    // Test burning more than available
    admin.mintTokens(amount: 100.0, recipient: &vault)
    Test.expectFailure(
        fun() {
            admin.burnTokens(amount: 200.0, from: &vault)
        },
        "Insufficient balance"
    )
    
    destroy vault
}
