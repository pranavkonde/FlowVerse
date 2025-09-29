import { Request, Response } from 'express';
import { chatService } from '../services/ChatService';

export class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const userName = req.user?.name;
      if (!userId || !userName) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { content, channel } = req.body;
      if (!content || !channel) {
        return res.status(400).json({ error: 'Message content and channel are required' });
      }

      const message = await chatService.sendMessage(userId, userName, content, channel);
      return res.json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getChannelMessages(req: Request, res: Response) {
    try {
      const { channel } = req.params;
      const { limit } = req.query;

      if (!channel) {
        return res.status(400).json({ error: 'Channel is required' });
      }

      const messages = await chatService.getChannelMessages(
        channel,
        limit ? parseInt(limit as string) : undefined
      );
      return res.json(messages);
    } catch (error) {
      console.error('Error getting channel messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addReaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { messageId, emoteId } = req.body;
      if (!messageId || !emoteId) {
        return res.status(400).json({ error: 'Message ID and emote ID are required' });
      }

      const success = await chatService.addReaction(messageId, userId, emoteId);
      if (!success) {
        return res.status(404).json({ error: 'Message not found' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error adding reaction:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async removeReaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { messageId } = req.params;
      if (!messageId) {
        return res.status(400).json({ error: 'Message ID is required' });
      }

      const success = await chatService.removeReaction(messageId, userId);
      if (!success) {
        return res.status(404).json({ error: 'Message or reaction not found' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error removing reaction:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserEmotes(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const emotes = await chatService.getUserEmotes(userId);
      return res.json(emotes);
    } catch (error) {
      console.error('Error getting user emotes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async unlockEmote(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { emoteId } = req.body;
      if (!emoteId) {
        return res.status(400).json({ error: 'Emote ID is required' });
      }

      const success = await chatService.unlockEmote(userId, emoteId);
      if (!success) {
        return res.status(400).json({ error: 'Invalid emote or already unlocked' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error unlocking emote:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const chatController = new ChatController();
