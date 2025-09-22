import FungibleToken from 0x9a0766d93b6608b7
import FreeFlowToken from 0x01
import FreeFlowStaking from 0x02

/// Transaction to unstake FFT tokens after the lock period has ended
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
        // Unstake the tokens
        let rewards = self.stakingAdmin.unstakeTokens(
            positionID: positionID,
            staker: &self.stakerVault
        )
        
        log("Successfully unstaked position ".concat(positionID.toString()).concat(" and received ").concat(rewards.toString()).concat(" FFT in rewards"))
    }
}
