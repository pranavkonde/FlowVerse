import OpenAI from 'openai';
import { VoiceCommand, AIResponse } from '../types/agent';

export class AIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey
    });
  }

  async processVoiceCommand(command: VoiceCommand): Promise<AIResponse> {
    try {
      const systemPrompt = `You are an AI assistant for Free Flow, a 2D multiplayer virtual environment with DeFi integration on the Flow blockchain.

Your capabilities:
1. Token price checking
2. Token swapping
3. Token transfers
4. General information about Flow blockchain and DeFi

When users ask about:
- "price of [token]" or "how much is [token]" -> respond with price check action
- "swap [amount] [from] to [to]" or "exchange [amount] [from] for [to]" -> respond with swap action
- "send [amount] [token] to [address]" or "transfer [amount] [token] to [address]" -> respond with transfer action
- General questions about Flow, DeFi, or the game -> provide helpful information

Always respond in a friendly, helpful tone. If you're not sure about something, ask for clarification.

Available tokens: FLOW, WFLOW`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: command.command }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, I could not process your request.';

      // Parse the response to determine if it's an action or just information
      const action = this.parseActionFromResponse(response, command.command);

      return {
        success: true,
        response: response,
        action: action
      };
    } catch (error) {
      console.error('Error processing voice command:', error);
      return {
        success: false,
        response: 'I apologize, I encountered an error processing your request.',
        error: 'AI service error'
      };
    }
  }

  private parseActionFromResponse(response: string, originalCommand: string): any | undefined {
    const command = originalCommand.toLowerCase();
    
    // Price check action
    if (command.includes('price') || command.includes('how much')) {
      const tokenMatch = command.match(/(?:price of|how much is)\s+(\w+)/i);
      if (tokenMatch) {
        return {
          type: 'price',
          data: {
            tokenAddress: this.getTokenAddress(tokenMatch[1])
          }
        };
      }
    }

    // Swap action
    if (command.includes('swap') || command.includes('exchange')) {
      const swapMatch = command.match(/(?:swap|exchange)\s+([\d.]+)\s+(\w+)\s+(?:to|for)\s+(\w+)/i);
      if (swapMatch) {
        return {
          type: 'swap',
          data: {
            amount: swapMatch[1],
            fromToken: this.getTokenAddress(swapMatch[2]),
            toToken: this.getTokenAddress(swapMatch[3])
          }
        };
      }
    }

    // Transfer action
    if (command.includes('send') || command.includes('transfer')) {
      const transferMatch = command.match(/(?:send|transfer)\s+([\d.]+)\s+(\w+)\s+to\s+([a-fA-F0-9x]+)/i);
      if (transferMatch) {
        return {
          type: 'transfer',
          data: {
            amount: transferMatch[1],
            tokenAddress: this.getTokenAddress(transferMatch[2]),
            toAddress: transferMatch[3]
          }
        };
      }
    }

    return undefined;
  }

  private getTokenAddress(symbol: string): string {
    const tokenMap: { [key: string]: string } = {
      'flow': '0x7e60df042a9c0868',
      'wflow': '0x1654653399040a61'
    };
    
    return tokenMap[symbol.toLowerCase()] || symbol;
  }

  async generateTextToSpeech(text: string): Promise<string> {
    try {
      // TODO: Integrate with ElevenLabs or similar TTS service
      // This is a placeholder implementation
      console.log('TTS request:', text);
      return 'TTS audio URL placeholder';
    } catch (error) {
      console.error('Error generating text to speech:', error);
      throw error;
    }
  }
}
