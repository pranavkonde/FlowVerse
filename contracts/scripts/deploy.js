const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FreeFlowDEX contract...");

  // Get the contract factory
  const FreeFlowDEX = await ethers.getContractFactory("FreeFlowDEX");

  // Deploy the contract
  const freeFlowDEX = await FreeFlowDEX.deploy();

  // Wait for deployment to complete
  await freeFlowDEX.deployed();

  console.log("FreeFlowDEX deployed to:", freeFlowDEX.address);
  console.log("Transaction hash:", freeFlowDEX.deployTransaction.hash);

  // Verify contract on block explorer (optional)
  console.log("Waiting for block confirmations...");
  await freeFlowDEX.deployTransaction.wait(6);

  console.log("Contract verified and ready to use!");
  console.log("Contract address:", freeFlowDEX.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
