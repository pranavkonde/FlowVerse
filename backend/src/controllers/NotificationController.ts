import { Request, Response } from 'express';
import { notificationService } from '../services/NotificationService';

export class NotificationController {
  async getUnreadNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const notifications = await notificationService.getUnreadNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { notificationId } = req.params;
      if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required' });
      }

      const success = await notificationService.markAsRead(userId, notificationId);
      if (!success) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await notificationService.markAllAsRead(userId);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { notificationId } = req.params;
      if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required' });
      }

      const success = await notificationService.deleteNotification(userId, notificationId);
      if (!success) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const notificationController = new NotificationController();



