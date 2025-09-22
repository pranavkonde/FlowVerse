import FungibleToken from 0x9a0766d93b6608b7
import FreeFlowToken from 0x01
import FreeFlowStaking from 0x02

/// Transaction to stake FFT tokens for a specified time period
transaction(amount: UFix64, tier: String) {
    
    // Reference to the staker's FFT vault
    let stakerVault: &FungibleToken.Vault
    
    // Reference to the staking admin
    let stakingAdmin: &FreeFlowStaking.Admin
    
    prepare(acct: AuthAccount) {
        // Get the staker's FFT vault
        self.stakerVault = acct.getCapability<&FreeFlowToken.Vault>(/public/FreeFlowTokenVault)
            .borrow() ?? panic("Could not borrow FFT vault")
        
        // Get the staking admin reference
        self.stakingAdmin = FreeFlowStaking.getAdmin()
    }
    
    execute {
        // Stake the tokens
        let positionID = self.stakingAdmin.stakeTokens(
            staker: &self.stakerVault,
            amount: amount,
            tier: tier
        )
        
        log("Successfully staked ".concat(amount.toString()).concat(" FFT tokens in tier ").concat(tier).concat(" with position ID: ").concat(positionID.toString()))
    }
}
