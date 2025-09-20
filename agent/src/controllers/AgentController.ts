import { Request, Response } from 'express';
import { BlockchainService } from '../services/BlockchainService';
import { AIService } from '../services/AIService';
import { VoiceCommand, SwapRequest, PriceRequest, TransferRequest } from '../types/agent';

export class AgentController {
  private blockchainService: BlockchainService;
  private aiService: AIService;

  constructor(blockchainService: BlockchainService, aiService: AIService) {
    this.blockchainService = blockchainService;
    this.aiService = aiService;
  }

  async handleVoiceCommand(req: Request, res: Response) {
    try {
      const { command, userId } = req.body;

      if (!command || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Command and userId are required'
        });
      }

      const voiceCommand: VoiceCommand = {
        command,
        userId,
        timestamp: new Date()
      };

      const aiResponse = await this.aiService.processVoiceCommand(voiceCommand);

      // If the AI response includes an action, execute it
      if (aiResponse.action) {
        switch (aiResponse.action.type) {
          case 'price':
            const priceResult = await this.blockchainService.getTokenPrice(aiResponse.action.data);
            aiResponse.response += ` The current price is $${priceResult.price || 'unknown'}.`;
            break;
          
          case 'swap':
            const swapResult = await this.blockchainService.swapTokens(aiResponse.action.data);
            if (swapResult.success) {
              aiResponse.response += ` Swap completed! Transaction: ${swapResult.transactionHash}`;
            } else {
              aiResponse.response += ` Swap failed: ${swapResult.error}`;
            }
            break;
          
          case 'transfer':
            const transferResult = await this.blockchainService.transferTokens(aiResponse.action.data);
            if (transferResult.success) {
              aiResponse.response += ` Transfer completed! Transaction: ${transferResult.transactionHash}`;
            } else {
              aiResponse.response += ` Transfer failed: ${transferResult.error}`;
            }
            break;
        }
      }

      res.json(aiResponse);
    } catch (error) {
      console.error('Error handling voice command:', error);
      res.status(500).json({
        success: false,
        response: 'I apologize, I encountered an error processing your request.',
        error: 'Internal server error'
      });
    }
  }

  async getTokenPrice(req: Request, res: Response) {
    try {
      const { tokenAddress, vsCurrency } = req.query;

      if (!tokenAddress) {
        return res.status(400).json({
          success: false,
          error: 'Token address is required'
        });
      }

      const priceRequest: PriceRequest = {
        tokenAddress: tokenAddress as string,
        vsCurrency: vsCurrency as string || 'usd'
      };

      const result = await this.blockchainService.getTokenPrice(priceRequest);
      res.json(result);
    } catch (error) {
      console.error('Error getting token price:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get token price'
      });
    }
  }

  async swapTokens(req: Request, res: Response) {
    try {
      const { fromToken, toToken, amount, userAddress, slippage } = req.body;

      if (!fromToken || !toToken || !amount || !userAddress) {
        return res.status(400).json({
          success: false,
          error: 'fromToken, toToken, amount, and userAddress are required'
        });
      }

      const swapRequest: SwapRequest = {
        fromToken,
        toToken,
        amount,
        userAddress,
        slippage: slippage || 0.5
      };

      const result = await this.blockchainService.swapTokens(swapRequest);
      res.json(result);
    } catch (error) {
      console.error('Error swapping tokens:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to swap tokens'
      });
    }
  }

  async transferTokens(req: Request, res: Response) {
    try {
      const { toAddress, amount, tokenAddress, userAddress } = req.body;

      if (!toAddress || !amount || !userAddress) {
        return res.status(400).json({
          success: false,
          error: 'toAddress, amount, and userAddress are required'
        });
      }

      const transferRequest: TransferRequest = {
        toAddress,
        amount,
        tokenAddress,
        userAddress
      };

      const result = await this.blockchainService.transferTokens(transferRequest);
      res.json(result);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to transfer tokens'
      });
    }
  }

  async getTokenInfo(req: Request, res: Response) {
    try {
      const { tokenAddress } = req.params;

      if (!tokenAddress) {
        return res.status(400).json({
          success: false,
          error: 'Token address is required'
        });
      }

      const tokenInfo = await this.blockchainService.getTokenInfo(tokenAddress);
      
      if (tokenInfo) {
        res.json({
          success: true,
          data: tokenInfo
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Token not found'
        });
      }
    } catch (error) {
      console.error('Error getting token info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get token info'
      });
    }
  }

  async getAccountBalance(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const { tokenAddress } = req.query;

      if (!address) {
        return res.status(400).json({
          success: false,
          error: 'Address is required'
        });
      }

      const balance = await this.blockchainService.getAccountBalance(address, tokenAddress as string);
      
      res.json({
        success: true,
        balance: balance
      });
    } catch (error) {
      console.error('Error getting account balance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get account balance'
      });
    }
  }
}
