import FungibleToken from 0x9a0766d93b6608b7
import FreeFlowToken from 0x01
import FreeFlowStaking from 0x02

/// Transaction to emergency unstake FFT tokens with a penalty (50% of staked amount and rewards)
/// This should only be used in extreme circumstances as it incurs significant penalties
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
        // Emergency unstake with penalty
        let totalReturned = self.stakingAdmin.emergencyUnstake(
            positionID: positionID,
            staker: &self.stakerVault
        )
        
        log("Emergency unstake completed for position ".concat(positionID.toString()).concat(". Total returned (after 50% penalty): ").concat(totalReturned.toString()).concat(" FFT"))
        log("WARNING: Emergency unstake incurs a 50% penalty on both staked amount and rewards!")
    }
}
