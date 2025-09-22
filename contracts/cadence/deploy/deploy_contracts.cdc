import FreeFlowToken from 0x1234567890abcdef
import FreeFlowNFT from 0x1234567890abcdef
import FreeFlowMarketplace from 0x1234567890abcdef

/// Deployment script for Free Flow contracts
/// This script deploys all contracts and sets up initial configuration
transaction() {
    
    // Reference to the deployer account
    let deployer: AuthAccount
    
    prepare(deployer: AuthAccount) {
        self.deployer = deployer
        
        // Deploy FreeFlowToken contract
        let tokenCode = FreeFlowToken.contractCode
        self.deployer.contracts.add(name: "FreeFlowToken", code: tokenCode)
        
        // Deploy FreeFlowNFT contract
        let nftCode = FreeFlowNFT.contractCode
        self.deployer.contracts.add(name: "FreeFlowNFT", code: nftCode)
        
        // Deploy FreeFlowMarketplace contract
        let marketplaceCode = FreeFlowMarketplace.contractCode
        self.deployer.contracts.add(name: "FreeFlowMarketplace", code: marketplaceCode)
        
        log("All contracts deployed successfully")
    }
    
    execute {
        // Post-deployment configuration
        log("Free Flow contracts deployment completed")
        log("Contract addresses:")
        log("FreeFlowToken: " + self.deployer.address.toString())
        log("FreeFlowNFT: " + self.deployer.address.toString())
        log("FreeFlowMarketplace: " + self.deployer.address.toString())
    }
}

/// Contract code constants
pub let FreeFlowToken.contractCode: String = """
import FungibleToken from 0x9a0766d93b6608b7
import MetadataViews from 0x631e88ae7f1d7c20

pub contract FreeFlowToken: FungibleToken, MetadataViews.Resolver {
    // Contract implementation here
    // (Full contract code would be included)
}
"""

pub let FreeFlowNFT.contractCode: String = """
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

pub contract FreeFlowNFT: NonFungibleToken, MetadataViews.Resolver {
    // Contract implementation here
    // (Full contract code would be included)
}
"""

pub let FreeFlowMarketplace.contractCode: String = """
import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

pub contract FreeFlowMarketplace {
    // Contract implementation here
    // (Full contract code would be included)
}
"""
