export const config = {
  // Privy Configuration
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  },
  
  // Socket.io Configuration
  socket: {
    url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002',
  },
  
  // Flow Blockchain Configuration
  flow: {
    rpcUrl: process.env.NEXT_PUBLIC_FLOW_RPC_URL || 'https://testnet.evm.nodes.onflow.org',
    chainId: parseInt(process.env.NEXT_PUBLIC_FLOW_CHAIN_ID || '545'),
  },
  
  // Contract Addresses
  contracts: {
    freeFlowSwap: process.env.NEXT_PUBLIC_FREEFLOW_SWAP_ADDRESS || '0x3DDfe46Bb38474D5179bFfE7451aA9268E5098bb',
    flowSwapRouter: process.env.NEXT_PUBLIC_FLOW_SWAP_ROUTER_ADDRESS || '0x8F90f58F9A67AFf3c1E8803DF843a15d40800FdE',
  },
  
  // Game Configuration
  game: {
    canvasWidth: 1200,
    canvasHeight: 800,
    playerSpeed: 200,
  },
};
