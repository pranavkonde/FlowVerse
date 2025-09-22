import FungibleToken from 0x9a0766d93b6608b7
import FreeFlowToken from 0x01
import FreeFlowStaking from 0x02

/// Transaction to claim accumulated staking rewards without unstaking
transaction(positionID: UInt64) {
    
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
        // Claim the rewards
        let rewards = self.stakingAdmin.claimRewards(
            positionID: positionID,
            staker: &self.stakerVault
        )
        
        log("Successfully claimed ".concat(rewards.toString()).concat(" FFT rewards from position ").concat(positionID.toString()))
    }
}
