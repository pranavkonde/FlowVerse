import FreeFlowToken from 0x01
import FreeFlowNFT from 0x02
import FreeFlowMarketplace from 0x03
import FreeFlowStaking from 0x04
import FreeFlowGovernance from 0x05

/// Transaction to deploy all Free Flow contracts
/// This transaction should be run by the contract deployer account
transaction() {
    
    prepare(acct: AuthAccount) {
        // Deploy FreeFlowToken
        acct.contracts.add(name: "FreeFlowToken", code: FreeFlowToken.code)
        
        // Deploy FreeFlowNFT
        acct.contracts.add(name: "FreeFlowNFT", code: FreeFlowNFT.code)
        
        // Deploy FreeFlowMarketplace
        acct.contracts.add(name: "FreeFlowMarketplace", code: FreeFlowMarketplace.code)
        
        // Deploy FreeFlowStaking
        acct.contracts.add(name: "FreeFlowStaking", code: FreeFlowStaking.code)
        
        // Deploy FreeFlowGovernance
        acct.contracts.add(name: "FreeFlowGovernance", code: FreeFlowGovernance.code)
        
        log("All Free Flow contracts deployed successfully!")
        log("Contract addresses:")
        log("- FreeFlowToken: ".concat(acct.address.toString()))
        log("- FreeFlowNFT: ".concat(acct.address.toString()))
        log("- FreeFlowMarketplace: ".concat(acct.address.toString()))
        log("- FreeFlowStaking: ".concat(acct.address.toString()))
        log("- FreeFlowGovernance: ".concat(acct.address.toString()))
    }
    
    execute {
        log("Contract deployment completed")
    }
}
